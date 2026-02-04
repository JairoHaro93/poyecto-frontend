// C:\PROYECTO\Frontend\src\app\pages\negocio\administrador\horasextra\horasextra.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import Swal from 'sweetalert2';
import { SwalStd } from '../../../../utils/swal.std';

import { AutenticacionService } from '../../../../services/sistema/autenticacion.service';
import { Iusuarios } from '../../../../interfaces/sistema/iusuarios.interface';

import {
  HorasExtrasService,
  HoraExtraPendiente,
  HoraExtraAprobadaMov, // ✅ lista detallada (movimientos)
} from '../../../../services/negocio_latacunga/horas-extras.service';

type TabHex = 'PENDIENTES' | 'APROBADAS';

type HoraExtraAprobadaGroup = {
  usuario_id: number;
  usuario_nombre: string;
  cantidad: number;
  total_minutos: number;
  items: HoraExtraAprobadaMov[];
};

@Component({
  selector: 'app-horasextra',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './horasextra.component.html',
  styleUrl: './horasextra.component.css',
})
export class HorasextraComponent implements OnInit {
  user?: Iusuarios;

  tab: TabHex = 'PENDIENTES';

  // selector de mes (YYYY-MM)
  mesPendientes = '';
  mesAprobadas = '';

  // loading
  cargandoPendientes = false;
  cargandoAprobadas = false;

  // data
  pendientes: HoraExtraPendiente[] = [];
  aprobadas: HoraExtraAprobadaMov[] = [];

  // ✅ agrupado para “celdas”
  aprobadasGroups: HoraExtraAprobadaGroup[] = [];

  // para evitar “parpadeo” por fila
  saving: Record<number, boolean> = {};

  constructor(
    private authService: AutenticacionService,
    private horasExtraService: HorasExtrasService,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.user = await this.authService.getUsuarioAutenticado();

      const ym = this.currentYM();
      this.mesPendientes = ym;
      this.mesAprobadas = ym;

      // por defecto carga pendientes del mes actual
      await this.cargarPendientes();
    } catch (e: any) {
      await SwalStd.error(
        SwalStd.getErrorMessage(e),
        'Error inicializando Horas Extra',
      );
    }
  }

  // =======================
  // helpers fechas
  // =======================
  private currentYM(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }
  fechaUI(ymd: string | null | undefined): string {
    const s = (ymd || '').slice(0, 10);
    if (!s) return '—';

    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const [y, m, d] = s.split('-');
      return `${d}/${m}/${y}`;
    }

    // DD/MM/YYYY (por si algún backend te lo manda así)
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
      return s;
    }

    return '—';
  }

  hhmm(s: string | null | undefined): string {
    if (!s) return '--:--';
    return String(s).slice(0, 5);
  }

  mmToHHMM(min: number): string {
    const n = Number(min || 0);
    const hh = Math.floor(n / 60);
    const mm = n % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }

  get totalAprobadasMin(): number {
    return (this.aprobadas || []).reduce(
      (acc, x) => acc + Number(x.minutos || 0),
      0,
    );
  }

  // =======================
  // eventos mes
  // =======================
  onMesPendientesChange() {
    this.cargarPendientes();
  }

  onMesAprobadasChange() {
    this.cargarAprobadas();
  }

  // =======================
  // cargar pendientes (por MES)
  // =======================
  async cargarPendientes(): Promise<void> {
    if (!this.mesPendientes || this.mesPendientes.length !== 7) {
      await SwalStd.warn('Selecciona un mes válido.');
      return;
    }

    this.cargandoPendientes = true;
    try {
      this.pendientes = await this.horasExtraService.listarPendientesPorMes(
        this.mesPendientes,
      );
    } catch (e: any) {
      if (String(e?.status) === '403') {
        this.pendientes = [];
        await SwalStd.warn(
          'No tienes solicitudes pendientes para aprobar (o no eres aprobador).',
        );
      } else {
        await SwalStd.error(
          SwalStd.getErrorMessage(e),
          'Error cargando pendientes',
        );
      }
    } finally {
      this.cargandoPendientes = false;
    }
  }

  // =======================
  // cargar aprobadas (MOVIMIENTOS por MES)
  // =======================
  async cargarAprobadas(): Promise<void> {
    if (!this.mesAprobadas || this.mesAprobadas.length !== 7) {
      await SwalStd.warn('Selecciona un mes válido.');
      return;
    }

    this.cargandoAprobadas = true;
    try {
      this.aprobadas = await this.horasExtraService.listarAprobadasMovPorMes(
        this.mesAprobadas,
      );

      // ✅ construir celdas (padre + items + resumen)
      this.aprobadasGroups = this.groupAprobadas(this.aprobadas);
    } catch (e: any) {
      this.aprobadas = [];
      this.aprobadasGroups = [];
      await SwalStd.error(
        SwalStd.getErrorMessage(e),
        'Error cargando aprobadas (movimientos)',
      );
    } finally {
      this.cargandoAprobadas = false;
    }
  }

  private groupAprobadas(
    list: HoraExtraAprobadaMov[],
  ): HoraExtraAprobadaGroup[] {
    const map = new Map<string, HoraExtraAprobadaGroup>();

    for (const it of list || []) {
      const usuarioId = Number((it as any).usuario_id || 0);
      const nombre = String((it as any).usuario_nombre || '').trim() || '—';

      // key robusta (por si usuario_id viene 0, agrupamos por nombre)
      const key =
        usuarioId > 0 ? `id:${usuarioId}` : `name:${nombre.toLowerCase()}`;

      if (!map.has(key)) {
        map.set(key, {
          usuario_id: usuarioId,
          usuario_nombre: nombre,
          cantidad: 0,
          total_minutos: 0,
          items: [],
        });
      }

      const g = map.get(key)!;
      g.items.push(it);
      g.cantidad += 1;
      g.total_minutos += Number((it as any).minutos || 0);
    }

    // ordenar items por fecha asc (puedes cambiar a DESC si prefieres)
    for (const g of map.values()) {
      g.items.sort((a: any, b: any) => {
        const fa = String(a?.fecha || '').slice(0, 10);
        const fb = String(b?.fecha || '').slice(0, 10);
        return fa.localeCompare(fb);
      });
    }

    // ordenar grupos por nombre
    return Array.from(map.values()).sort((a, b) =>
      a.usuario_nombre.localeCompare(b.usuario_nombre, 'es', {
        sensitivity: 'base',
      }),
    );
  }

  // =======================
  // acciones aprobar/rechazar
  // =======================
  async aprobar(item: HoraExtraPendiente): Promise<void> {
    const ok = await SwalStd.confirm({
      title: 'Aprobar horas extra',
      text: `¿Aprobar ${this.mmToHHMM(item.minutos)} para ${item.usuario_nombre} (${this.fechaUI(item.fecha)})?`,
      confirmText: 'Aprobar',
    });
    if (!ok) return;

    await this.withSaving(item.id, async () => {
      await this.horasExtraService.aprobar(item.id);
      await SwalStd.success('✅ Solicitud aprobada');
      await this.cargarPendientes();
    });
  }

  async rechazar(item: HoraExtraPendiente): Promise<void> {
    const res = await Swal.fire({
      title: 'Rechazar horas extra',
      input: 'text',
      inputLabel: 'Motivo (obligatorio)',
      inputPlaceholder: 'Ej: No procede por falta de evidencia',
      showCancelButton: true,
      confirmButtonText: 'Rechazar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || value.trim().length < 3)
          return 'Ingresa un motivo (mínimo 3 caracteres).';
        return null;
      },
    });

    if (!res.isConfirmed) return;

    await this.withSaving(item.id, async () => {
      await this.horasExtraService.rechazar(item.id, String(res.value).trim());
      await SwalStd.success('✅ Solicitud rechazada');
      await this.cargarPendientes();
    });
  }

  private async withSaving(id: number, fn: () => Promise<void>) {
    this.saving[id] = true;
    try {
      await fn();
    } finally {
      this.saving[id] = false;
    }
  }

  // =======================
  // tabs
  // =======================
  async setTab(t: TabHex) {
    this.tab = t;
    if (t === 'PENDIENTES') {
      await this.cargarPendientes();
    } else {
      await this.cargarAprobadas();
    }
  }
}
