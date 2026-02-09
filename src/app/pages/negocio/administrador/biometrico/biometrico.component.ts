import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  HuellasService,
  HuellasPorTimbreResponse,
} from '../../../../services/negocio_latacunga/huellas.service';
import { SoketService } from '../../../../services/socket_io/soket.service';
import { UsuariosService } from '../../../../services/sistema/usuarios.service';
import { Iusuarios } from '../../../../interfaces/sistema/iusuarios.interface';
import {
  TimbresService,
  TimbreDto,
} from '../../../../services/negocio_latacunga/timbres.service';

interface TimbreEstado {
  lector_codigo: string;
  nombre?: string;
  sucursal?: string;
  tipo?: 'MAESTRO' | 'PRODUCCION' | string;
  online: boolean;
  modo_actual: 'PRODUCCION' | 'ENROLAMIENTO';
  usuario_enrolando_id?: number;
  last_ping?: string | number | null;
  // 👇 flag solo de frontend
  enrolando?: boolean;
}

interface UsuarioEnTimbre {
  usuario_id: number;
  nombre_completo: string;
  usuario_usuario: string;
  usuario_cedula: string;
  huellas: {
    huella_id: number;
    finger_id: number;
    slot: number;
  }[];
}

interface UsuarioResumen {
  id: number;
  nombre_completo: string;
}

@Component({
  selector: 'app-biometrico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './biometrico.component.html',
  styleUrls: ['./biometrico.component.css'],
})
export class BiometricoComponent implements OnInit, OnDestroy {
  timbres: TimbreEstado[] = [];

  usuarios: UsuarioResumen[] = [];
  cargandoUsuarios = false;
  cargandoTimbres = false;

  selectorVisible = false;
  timbreSeleccionado: TimbreEstado | null = null;
  usuarioSeleccionadoId: number | null = null;

  private unsubscribers: (() => void)[] = [];

  // Gestión de usuarios por timbre
  huellasVisible = false;
  cargandoHuellas = false;
  usuariosEnTimbre: UsuarioEnTimbre[] = [];
  timbreHuellasSeleccionado: TimbreEstado | null = null;

  constructor(
    private socketService: SoketService,
    private usuariosService: UsuariosService,
    private timbresService: TimbresService,
    private huellasService: HuellasService, // 👈 nuevo
  ) {}

  async ngOnInit(): Promise<void> {
    // 1) conectamos socket
    await this.socketService.connectSocket();

    // 2) cargamos catálogos
    await Promise.all([this.cargarUsuarios(), this.cargarTimbres()]);

    // 3) cambios de estado de timbre (online / modo / ping)
    const onTimbreEstado = (estado: TimbreEstado) => {
      if (!estado || !estado.lector_codigo) return;

      // console.log('📡 timbre_estado recibido en front:', estado);

      const idx = this.timbres.findIndex(
        (t) => t.lector_codigo === estado.lector_codigo,
      );

      if (idx === -1) {
        // El backend mandó un timbre que no está en catálogo HTTP
        return;
      }

      const copia = [...this.timbres];
      const actual = copia[idx];

      copia[idx] = {
        ...actual,
        online: estado.online,
        modo_actual: estado.modo_actual ?? actual.modo_actual,
        last_ping: estado.last_ping ?? actual.last_ping ?? null,
        usuario_enrolando_id:
          estado.usuario_enrolando_id ?? actual.usuario_enrolando_id,
        // no tocamos enrolando aquí, eso lo maneja el evento de completo
      };

      this.timbres = copia;
    };

    // 4) evento específico: enrolamiento COMPLETO
    const onEnrolamientoCompleto = (payload: { lector_codigo: string }) => {
      const lc = payload?.lector_codigo;
      if (!lc) return;

      //  console.log('✅ Enrolamiento completado para timbre', lc);

      // quitar flag enrolando
      this.timbres = this.timbres.map((t) =>
        t.lector_codigo === lc ? { ...t, enrolando: false } : t,
      );

      // si el modal está abierto para este timbre, lo cerramos
      if (
        this.selectorVisible &&
        this.timbreSeleccionado &&
        this.timbreSeleccionado.lector_codigo === lc
      ) {
        this.selectorVisible = false;
        this.timbreSeleccionado = null;
        this.usuarioSeleccionadoId = null;
      }
    };

    this.socketService.on('timbre_estado', onTimbreEstado);
    this.socketService.on(
      'timbre_enrolamiento_completo',
      onEnrolamientoCompleto,
    );

    this.unsubscribers.push(
      () => this.socketService.off('timbre_estado', onTimbreEstado),
      () =>
        this.socketService.off(
          'timbre_enrolamiento_completo',
          onEnrolamientoCompleto,
        ),
    );
  }

  ngOnDestroy(): void {
    this.unsubscribers.forEach((fn) => fn());
  }

  // ==========================
  //   CARGA DE CATÁLOGOS
  // ==========================

  private async cargarTimbres(): Promise<void> {
    this.cargandoTimbres = true;
    try {
      const lista: TimbreDto[] = await this.timbresService.getAll();

      this.timbres =
        (lista || []).map((t) => ({
          lector_codigo: t.lector_codigo,
          nombre: t.nombre,
          sucursal: t.sucursal,
          tipo: t.tipo as any,
          online: false,
          modo_actual: (t.modo_actual as any) || 'PRODUCCION',
          usuario_enrolando_id: t.usuario_enrolando_id ?? 0,
          last_ping: null,
          enrolando: false,
        })) ?? [];
    } catch (error) {
      console.error('❌ Error cargando timbres:', error);
      this.timbres = [];
    } finally {
      this.cargandoTimbres = false;
    }
  }

  private async cargarUsuarios(): Promise<void> {
    this.cargandoUsuarios = true;
    try {
      const lista: Iusuarios[] = await this.usuariosService.getAll();

      this.usuarios = (lista || [])
        .map((u) => ({
          id: Number(u.id),
          nombre_completo: `${u.nombre} ${u.apellido}`.trim(),
        }))
        .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo));
    } catch (error) {
      console.error('❌ Error cargando usuarios para enrolamiento:', error);
    } finally {
      this.cargandoUsuarios = false;
    }
  }

  // ==========================
  //  ACCIONES SOBRE TIMBRE
  // ==========================

  onClickEnrolar(timbre: TimbreEstado): void {
    if (timbre.modo_actual === 'ENROLAMIENTO') {
      // Salir de modo enrolamiento
      this.socketService.emit('timbre_set_modo', {
        lector_codigo: timbre.lector_codigo,
        modo_actual: 'PRODUCCION',
        usuario_enrolando_id: 0,
      });
      return;
    }

    // Entrar en modo enrolamiento → mostramos modal
    this.timbreSeleccionado = timbre;
    this.usuarioSeleccionadoId = null;
    this.selectorVisible = true;
  }

  confirmarEnrolamiento(): void {
    if (!this.timbreSeleccionado || !this.usuarioSeleccionadoId) return;

    const lc = this.timbreSeleccionado.lector_codigo;

    // 1) Marcar en el array principal
    this.timbres = this.timbres.map((t) =>
      t.lector_codigo === lc ? { ...t, enrolando: true } : t,
    );

    // 2) Marcar también en el timbre seleccionado (para que el @if lo vea)
    this.timbreSeleccionado = {
      ...this.timbreSeleccionado,
      enrolando: true,
    };

    // 3) Enviar al backend que entre en modo ENROLAMIENTO
    this.socketService.emit('timbre_set_modo', {
      lector_codigo: lc,
      modo_actual: 'ENROLAMIENTO',
      usuario_enrolando_id: this.usuarioSeleccionadoId,
    });

    // ❌ OJO: NO cerramos el modal aquí.
    // Se cerrará cuando llegue 'timbre_enrolamiento_completo' desde el backend.
  }

  cerrarSelector(): void {
    // Si quieres que "Cancelar" saque el timbre de ENROLAMIENTO, puedes descomentar:

    if (this.timbreSeleccionado?.modo_actual === 'ENROLAMIENTO') {
      this.socketService.emit('timbre_set_modo', {
        lector_codigo: this.timbreSeleccionado.lector_codigo,
        modo_actual: 'PRODUCCION',
        usuario_enrolando_id: 0,
      });
    }

    this.selectorVisible = false;
    this.timbreSeleccionado = null;
    this.usuarioSeleccionadoId = null;
  }

  getUltimoPing(t: TimbreEstado): string {
    if (t.last_ping == null) return '—';

    let d: Date;

    if (typeof t.last_ping === 'number') {
      d = new Date(t.last_ping);
    } else {
      d = new Date(t.last_ping);
    }

    if (isNaN(d.getTime())) return '—';

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  }

  getNombreUsuario(id?: number): string {
    if (!id) return '—';
    const u = this.usuarios.find((x) => x.id === id);
    return u ? u.nombre_completo : `ID: ${id}`;
  }

  // ==========================
  //  GESTIÓN DE USUARIOS EN TIMBRE
  // ==========================

  async onClickVerUsuariosTimbre(timbre: TimbreEstado): Promise<void> {
    this.timbreHuellasSeleccionado = timbre;
    this.huellasVisible = true;
    this.usuariosEnTimbre = [];
    this.cargandoHuellas = true;

    try {
      const resp: HuellasPorTimbreResponse =
        await this.huellasService.getHuellasActivasPorTimbre(
          timbre.lector_codigo,
        );

      const mapa = new Map<number, UsuarioEnTimbre>();

      for (const h of resp.huellas || []) {
        if (!mapa.has(h.usuario_id)) {
          mapa.set(h.usuario_id, {
            usuario_id: h.usuario_id,
            nombre_completo: `${h.usuario_nombre} ${h.usuario_apellido}`.trim(),
            usuario_usuario: h.usuario_usuario,
            usuario_cedula: h.usuario_cedula,
            huellas: [],
          });
        }

        mapa.get(h.usuario_id)!.huellas.push({
          huella_id: h.huella_id,
          finger_id: h.finger_id,
          slot: h.slot,
        });
      }

      this.usuariosEnTimbre = Array.from(mapa.values()).sort((a, b) =>
        a.nombre_completo.localeCompare(b.nombre_completo),
      );
    } catch (error) {
      console.error('❌ Error cargando huellas del timbre:', error);
      this.usuariosEnTimbre = [];
    } finally {
      this.cargandoHuellas = false;
    }
  }

  cerrarHuellas(): void {
    this.huellasVisible = false;
    this.timbreHuellasSeleccionado = null;
    this.usuariosEnTimbre = [];
  }

  async onClickEliminarUsuarioDeTimbre(u: UsuarioEnTimbre): Promise<void> {
    if (!this.timbreHuellasSeleccionado) return;

    const lector = this.timbreHuellasSeleccionado.lector_codigo;

    const confirmar = window.confirm(
      `¿Eliminar al usuario ${u.nombre_completo} (ID: ${u.usuario_id}) ` +
        `del timbre ${lector}? Esto eliminará todas sus huellas en este timbre.`,
    );

    if (!confirmar) return;

    try {
      await this.huellasService.deleteUsuarioDelTimbre(lector, u.usuario_id);

      // Quitamos al usuario de la lista localmente
      this.usuariosEnTimbre = this.usuariosEnTimbre.filter(
        (x) => x.usuario_id !== u.usuario_id,
      );
    } catch (error) {
      console.error('❌ Error eliminando usuario del timbre:', error);
    }
  }
}
