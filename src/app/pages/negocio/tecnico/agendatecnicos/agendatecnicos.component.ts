import { Component, inject } from '@angular/core';

// Angular
import { DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// UI
import { Modal } from 'bootstrap';
import Swal from 'sweetalert2';

// Interfaces (dominio)
import { Iagenda } from '../../../../interfaces/negocio/agenda/iagenda.interface';
import { Iusuarios } from '../../../../interfaces/sistema/iusuarios.interface';
import { Iclientes } from '../../../../interfaces/negocio/clientes/iclientes.interface';

// Servicios (aplicación)
import { AgendaService } from '../../../../services/negocio_latacunga/agenda.service';
import { AutenticacionService } from '../../../../services/sistema/autenticacion.service';
import { SoportesService } from '../../../../services/negocio_latacunga/soportes.service';
import { SoketService } from '../../../../services/socket_io/soket.service';
import { VisService } from '../../../../services/negocio_latacunga/vis.service';
import {
  ClienteBatchItem,
  ClientesService,
} from '../../../../services/negocio_atuntaqui/clientes.service';
import { firstValueFrom } from 'rxjs';

// 👇 NUEVO: API de imágenes unificada
import { ImagesService } from '../../../../services/negocio_latacunga/images.service';
import { ImageItem } from '../../../../interfaces/negocio/images/images';

/** Mapa tipado para imágenes por campo (fachada, router, etc.) */
type ImagenMap = Record<string, { url: string; ruta: string }>;

@Component({
  selector: 'app-agendatecnicos',
  standalone: true,
  imports: [DatePipe, CommonModule, FormsModule],
  templateUrl: './agendatecnicos.component.html',
  styleUrls: ['./agendatecnicos.component.css'],
})
export class AgendatecnicosComponent {
  // =========================
  // ESTADO / PROPIEDADES
  // =========================

  /** Lista de trabajos asignados al técnico autenticado */
  agendaTecnicosList: Iagenda[] = [];

  /** Datos del usuario autenticado */
  datosUsuario!: Iusuarios;

  /** Trabajo seleccionado en la tabla (referencia de edición/visualización) */
  trabajoAgenda: Iagenda | null = null;

  /** Estructura auxiliar para detalles según el tipo (SOPORTE/VIS/LOS/INSTALACION) */
  trabajoTabla: any;

  /** Vista previa de imagen (URL) para modal */
  imagenSeleccionada: string | null = null;

  /** Datos de cliente/servicio asociados al ord_ins del trabajo */
  clienteSeleccionado: Iclientes = {} as Iclientes;

  /** Comentario editable del cliente (si aplica) */
  comentarioCliente: string | null = null;

  /** Campos de imagen esperados para instalación */
  readonly camposImagen: string[] = [
    'fachada',
    'router',
    'potencia',
    'ont',
    'speedtest',
    'cable_1',
    'cable_2',
    'equipo_1',
    'equipo_2',
    'equipo_3',
  ];

  /** Imágenes de instalación (tabla neg_t_instalaciones, id = ord_ins) */
  imagenesInstalacion: ImagenMap = {};

  /** Imágenes de visita/LOS (tabla neg_t_vis, id = age_id_tipo) */
  imagenesVisita: ImagenMap = {};

  /** 👇 NUEVO: Imágenes de infraestructura (API nueva) */
  imagenesInfra: ImageItem[] = [];

  /** Buffer temporal para inputs file por campo */
  imagenesSeleccionadas: Record<string, File> = {};

  // =========================
  // INYECCIÓN DE SERVICIOS
  // =========================

  private readonly agendaService = inject(AgendaService);
  private readonly authService = inject(AutenticacionService);
  private readonly soporteService = inject(SoportesService);
  private readonly visService = inject(VisService);
  private readonly clientesService = inject(ClientesService);

  private readonly imagesService = inject(ImagesService); // NUEVO (infraestructura)
  private readonly socketService = inject(SoketService);

  private clienteCache = new Map<string, ClienteBatchItem>();

  // =========================
  // CICLO DE VIDA
  // =========================

  isReady = false;

  async ngOnInit() {
    try {
      this.datosUsuario = await this.authService.getUsuarioAutenticado();
      const idtec = this.datosUsuario.id;

      this.socketService.on('trabajoAgendadoTecnico', async () => {
        //  console.log('📥 Trabajo agendado para este técnico');
        this.agendaTecnicosList = await this.agendaService.getAgendaTec(idtec!);
        await this.enrichAgendaTecnicosList();
      });

      this.agendaTecnicosList = await this.agendaService.getAgendaTec(idtec!);
      await this.enrichAgendaTecnicosList();
    } catch (error) {
      console.error('❌ Error al obtener la agenda del técnico', error);
    } finally {
      this.isReady = true;
    }
  }

  /**
   * Enriquecimiento por lote de agendaTecnicosList usando ord_ins.
   */
  async enrichAgendaTecnicosList(): Promise<void> {
    const items = this.agendaTecnicosList || [];
    if (!Array.isArray(items) || items.length === 0) return;

    const faltantes = Array.from(
      new Set(
        items
          .map((it) => String((it as any).ord_ins))
          .filter((key) => !!key && !this.clienteCache.has(key)),
      ),
    );

    if (faltantes.length > 0) {
      try {
        const resp = await firstValueFrom(
          this.clientesService.getClientesByOrdInsBatch(faltantes),
        );
        for (const row of resp ?? []) {
          this.clienteCache.set(String(row.orden_instalacion), row);
        }
      } catch (e) {
        console.error('❌ Error obteniendo clientes batch:', e);
      }
    }

    this.agendaTecnicosList = items.map((it) => {
      const info = this.clienteCache.get(String((it as any).ord_ins));
      return {
        ...it,
        clienteNombre:
          info?.nombre_completo ??
          (it as any).clienteNombre ??
          (it as any).nombre_completo ??
          '',
        clienteCedula: info?.cedula ?? (it as any).clienteCedula ?? '',
        clienteDireccion: info?.direccion ?? (it as any).clienteDireccion ?? '',
        clienteTelefonos: info?.telefonos ?? (it as any).clienteTelefonos ?? '',
        clientePlan: info?.plan_nombre ?? (it as any).clientePlan ?? '',
        clienteIP: info?.ip ?? (it as any).clienteIP ?? '',
      } as any;
    });
  }

  // =========================
  // ACCIONES PRINCIPALES
  // =========================

  async verDetalle(trabajo: Iagenda) {
    try {
      this.trabajoAgenda = trabajo;
      this.trabajoTabla = this.trabajoAgenda;

      // limpiar buffers
      this.imagenesInstalacion = {};
      this.imagenesVisita = {};
      this.imagenesInfra = [];

      // ⬇️ SOLO si NO es INFRAESTRUCTURA
      if (trabajo.age_tipo !== 'INFRAESTRUCTURA') {
        this.cargarImagenesInstalacion(String(trabajo.ord_ins));
      }

      // datos de cliente
      this.clienteSeleccionado =
        await this.clientesService.getInfoServicioByOrdId(
          Number(trabajo.ord_ins),
        );

      // ⬇️ SOLO si ES INFRAESTRUCTURA
      if (trabajo.age_tipo === 'INFRAESTRUCTURA') {
        this.cargarImagenesInfraestructura(trabajo.age_id_tipo);
      }

      const el = document.getElementById('detalleModal');
      if (el) new Modal(el).show();
    } catch (error) {
      console.error('Error al cargar detalle del soporte:', error);
    }
  }

  async guardarSolucion() {
    if (!this.trabajoAgenda) return;

    try {
      const body: Iagenda = {
        ...this.trabajoAgenda,
        age_estado: 'CONCLUIDO',
        age_solucion: this.trabajoAgenda.age_solucion,
      };

      await this.agendaService.actualizarAgendaSolucion(body.id, body);

      if (this.trabajoAgenda.age_tipo !== 'INSTALACION') {
        const idVis = Number(
          this.trabajoTabla?.id ?? this.trabajoAgenda.age_id_tipo,
        );
        /* await this.visService.updateVisById(
          idVis,
          'RESUELTO',
          this.trabajoAgenda.age_solucion
        );*/

        const bodySop = {
          reg_sop_estado: 'RESUELTO',
          reg_sop_sol_det: this.trabajoAgenda.age_solucion,
        };
        await this.soporteService.actualizarEstadoSop(
          this.trabajoAgenda.age_id_sop,
          bodySop,
        );
      }

      this.socketService.emit('trabajoCulminado', {
        tecnicoId: this.datosUsuario.id,
      });

      const idtec = this.datosUsuario?.id;
      if (idtec) {
        this.agendaTecnicosList = await this.agendaService.getAgendaTec(idtec);
      }

      Swal.fire({
        icon: 'success',
        title: 'Trabajo actualizado',
        text: '✅ Trabajo actualizado correctamente.',
        timer: 1000,
        showConfirmButton: false,
      });

      const el = document.getElementById('editarModal');
      const modal = el ? Modal.getInstance(el) : null;
      modal?.hide();
    } catch (error) {
      console.error('❌ Error al actualizar trabajo:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: '❌ Error al guardar vis cambios.',
        timer: 2000,
        showConfirmButton: false,
      });
    }
  }

  async abrirModalEditar(trabajo: Iagenda) {
    try {
      this.clienteSeleccionado =
        await this.clientesService.getInfoServicioByOrdId(
          Number(trabajo.ord_ins),
        );

      this.trabajoAgenda = { ...trabajo };

      if (this.trabajoAgenda.age_tipo === 'INFRAESTRUCTURA') {
        // Solo infraestructura
        this.cargarImagenesInfraestructura(this.trabajoAgenda.age_id_tipo);
        this.imagenesInstalacion = {};
        this.imagenesVisita = {};
      } else {
        // Inst/Vis/Los/Trabajo
        this.refrescarInstalacion(this.trabajoAgenda.ord_ins);

        // 🔴 antes: siempre llamabas visitas → 404 en instalación
        // ✅ ahora: solo VIS/LOS
        if (
          this.trabajoAgenda.age_tipo === 'VISITA' ||
          this.trabajoAgenda.age_tipo === 'LOS'
        ) {
          this.cargarImagenesVisita(this.trabajoAgenda.age_id_tipo);
        } else {
          this.imagenesVisita = {};
        }
      }

      // trabajoTabla (igual que ya tenías)
      if (this.trabajoAgenda.age_tipo === 'SOPORTE') {
        this.trabajoTabla = await this.soporteService.getSopById(
          Number(this.trabajoAgenda.age_id_tipo),
        );
      } else if (
        this.trabajoAgenda.age_tipo === 'VISITA' ||
        this.trabajoAgenda.age_tipo === 'LOS'
      ) {
        this.trabajoTabla = { id: Number(this.trabajoAgenda.age_id_tipo) };
      } else {
        this.trabajoTabla = this.trabajoAgenda;
      }

      const el = document.getElementById('editarModal');
      if (el) new Modal(el).show();
    } catch (error) {
      console.error('❌ Error al cargar detalle del soporte:', error);
    }
  }

  // =========================
  // CARGA DE IMÁGENES (GET)
  // =========================

  private cargarImagenesInstalacion(ord_ins: string): void {
    this.refrescarInstalacion(ord_ins);
  }

  private cargarImagenesVisita(id: string | number): void {
    this.refrescarVisita(id);
  }

  private cargarImagenesInfraestructura(entityId: string | number): void {
    this.imagesService.list('infraestructura', entityId).subscribe({
      next: (imgs) => (this.imagenesInfra = imgs ?? []),
      error: (err) => {
        console.error('❌ Error cargando imágenes infraestructura:', err);
        this.imagenesInfra = [];
      },
    });
  }

  abrirImagenModal(url: string) {
    this.imagenSeleccionada = url;
    const el = document.getElementById('modalImagenAmpliada');
    if (el) new Modal(el).show();
  }

  // =========================
  // SUBIDA DE IMÁGENES (POST)
  // =========================

  /** LEGADO: subida para VIS/LOS (solución) */
  onImagenSolucionSeleccionada(event: Event, campo: string) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.trabajoAgenda) return;

    const idVis = this.trabajoAgenda.age_id_tipo;
    const pos = Number(campo.split('_')[1]) || undefined;

    // preview optimista
    const objectUrl = URL.createObjectURL(file);
    const key = `img_${pos ?? ''}`.trim();
    this.imagenesVisita = {
      ...this.imagenesVisita,
      [key]: { url: objectUrl, ruta: objectUrl },
    };

    this.imagesService
      .upload('visitas', idVis, file, { tag: 'img', position: pos })
      .subscribe({
        next: (resp: any) => {
          const backendUrl =
            resp?.item?.url || resp?.imagen?.url || resp?.url || null;
          if (backendUrl) {
            this.imagenesVisita = {
              ...this.imagenesVisita,
              [key]: { url: backendUrl, ruta: backendUrl },
            };
          } else {
            this.refrescarVisita(idVis);
          }
          URL.revokeObjectURL(objectUrl);
        },
        error: (err) => {
          console.error(`❌ Error subiendo imagen de solución (${campo})`, err);
          URL.revokeObjectURL(objectUrl);
          this.refrescarVisita(idVis);
        },
      });
  }

  /** LEGADO: subida para instalación (ord_ins) */
  onImagenSeleccionada(event: Event, campo: string) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.trabajoAgenda) return;

    const ordIns = this.trabajoAgenda.ord_ins;

    // 1) Preview inmediato (optimista)
    const objectUrl = URL.createObjectURL(file);
    this.imagenesInstalacion = {
      ...this.imagenesInstalacion,
      [campo]: { url: objectUrl, ruta: objectUrl },
    };

    // 2) Subir y luego consolidar con la respuesta (o refrescar)
    this.imagesService
      .upload('instalaciones', ordIns, file, { tag: campo })
      .subscribe({
        next: (resp: any) => {
          // trata de tomar la URL del backend si viene
          const backendUrl =
            resp?.item?.url || resp?.imagen?.url || resp?.url || null;

          if (backendUrl) {
            this.imagenesInstalacion = {
              ...this.imagenesInstalacion,
              [campo]: { url: backendUrl, ruta: backendUrl },
            };
          } else {
            // si la API no devuelve el item, recarga el listado
            this.refrescarInstalacion(ordIns);
          }

          URL.revokeObjectURL(objectUrl); // limpiamos el blob temporal
        },
        error: (err) => {
          console.error(
            `❌ Error subiendo imagen de instalación (${campo})`,
            err,
          );
          URL.revokeObjectURL(objectUrl);
          // opcional: revertir al estado del servidor
          this.refrescarInstalacion(ordIns);
        },
      });
  }

  /** 👇 NUEVO: subida para INFRAESTRUCTURA (API nueva) */
  // Reemplaza el método existente por este (firma sin opts)
  onImagenInfraSeleccionada(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.trabajoAgenda) return;

    const entityId = this.trabajoAgenda.age_id_tipo;
    const position = this.nextSolPosition;

    // (opcional) preview optimista:
    // const url = URL.createObjectURL(file);
    // this.imagenesInfra = [...this.imagenesInfra, { id: undefined, url, tag: 'sol', position } as any];

    this.imagesService
      .upload('infraestructura', entityId, file, { tag: 'sol', position })
      .subscribe({
        next: () => {
          this.cargarImagenesInfraestructura(entityId); // refresca lista
          input.value = ''; // resetea input para permitir mismo archivo de nuevo
          // URL.revokeObjectURL(url); // si usaste preview optimista
        },
        error: (err) => {
          console.error('❌ Error subiendo imagen de infraestructura:', err);
          // URL.revokeObjectURL(url); // si usaste preview optimista
        },
      });
  }

  // =========================
  // HELPERS DE VISTA
  // =========================

  esImagenValida(campo: string): boolean {
    const img = this.imagenesInstalacion?.[campo];
    return !!(
      img &&
      img.ruta &&
      img.ruta !== 'null' &&
      img.url &&
      !img.url.includes('undefined/imagenes/null')
    );
  }

  private refrescarInstalacion(ordIns: string) {
    this.imagesService.list('instalaciones', ordIns).subscribe({
      next: (items) => (this.imagenesInstalacion = this.adaptListToMap(items)),
      error: () => (this.imagenesInstalacion = {}),
    });
  }

  private refrescarVisita(idVis: number | string) {
    this.imagesService.list('visitas', idVis).subscribe({
      next: (items) => (this.imagenesVisita = this.adaptVisToMap(items)),
      error: () => (this.imagenesVisita = {}),
    });
  }

  /** instala/infra: usa tag como clave; si viene (tag,position) => tag_position */
  private adaptListToMap(items: ImageItem[]): ImagenMap {
    const map: ImagenMap = {};
    for (const it of items ?? []) {
      const base = (it.tag || 'otros').trim();
      const key =
        typeof it.position === 'number' ? `${base}_${it.position}` : base;
      map[key] = { url: it.url, ruta: it.url };
    }
    return map;
  }

  /** visitas: queremos claves img_1..img_4 desde (tag='img', position) */
  private adaptVisToMap(items: ImageItem[]): ImagenMap {
    const map: ImagenMap = {};
    for (const it of items ?? []) {
      const key =
        it.tag === 'img' && typeof it.position === 'number'
          ? `img_${it.position}`
          : it.tag || 'otros';
      map[key] = { url: it.url, ruta: it.url };
    }
    return map;
  }

  // 👇 añade este getter en la clase
  get nextSolPosition(): number {
    const sols = (this.imagenesInfra ?? []).filter(
      (i) => (i.tag || '').toLowerCase() === 'sol',
    );
    const maxPos = Math.max(
      0,
      ...sols.map((i) => (typeof i.position === 'number' ? i.position : 0)),
    );
    return maxPos + 1;
  }

  /** (opcional) trackBy para imágenes de infraestructura */
  trackInfra = (_: number, img: ImageItem) => img.id ?? img.url;
}
