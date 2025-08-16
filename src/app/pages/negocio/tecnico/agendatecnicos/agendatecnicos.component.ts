import { Component, inject } from '@angular/core';

// Angular
import { DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// UI
import { Modal } from 'bootstrap';
import Swal from 'sweetalert2';

// Interfaces (dominio)
import { Iagenda } from '../../../../interfaces/negocio/agenda/iagenda.interface';
import { Isoportes } from '../../../../interfaces/negocio/soportes/isoportes.interface';
import { Iusuarios } from '../../../../interfaces/sistema/iusuarios.interface';
import { Iclientes } from '../../../../interfaces/negocio/clientes/iclientes.interface';

// Servicios (aplicación)
import { AgendaService } from '../../../../services/negocio_latacunga/agenda.service';
import { AutenticacionService } from '../../../../services/sistema/autenticacion.service';
import { SoportesService } from '../../../../services/negocio_latacunga/soportes.service';
import { SoketService } from '../../../../services/socket_io/soket.service';
import { ImagenesService } from '../../../../services/negocio_latacunga/imagenes.service';
import { VisService } from '../../../../services/negocio_latacunga/vis.service';
import { ClientesService } from '../../../../services/negocio_atuntaqui/clientes.service';

/** Mapa tipado para imágenes por campo (fachada, router, etc.) */
type ImagenMap = Record<string, { url: string; ruta: string }>;

@Component({
  selector: 'app-agendatecnicos',
  standalone: true,
  imports: [DatePipe, CommonModule, FormsModule],
  templateUrl: './agendatecnicos.component.html',
  styleUrls: ['./agendatecnicos.component.css'], // ✅ Angular espera un array
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
  private readonly imagenesService = inject(ImagenesService);
  private readonly socketService = inject(SoketService);

  // =========================
  // CICLO DE VIDA
  // =========================

  /**
   * Carga usuario, agenda inicial y queda escuchando asignaciones por socket.
   */
  async ngOnInit() {
    try {
      this.datosUsuario = await this.authService.getUsuarioAutenticado();
      const idtec = this.datosUsuario.id;

      // 🔔 evento socket: cuando agendan algo a este técnico, recargar
      this.socketService.on('trabajoAgendadoTecnico', async () => {
        console.log('📥 Trabajo agendado para este técnico');
        this.agendaTecnicosList = await this.agendaService.getAgendaTec(idtec!);
      });

      // ▶ carga inicial de agenda
      this.agendaTecnicosList = await this.agendaService.getAgendaTec(idtec!);
    } catch (error) {
      console.error('❌ Error al obtener la agenda del técnico', error);
    }
  }

  // =========================
  // ACCIONES PRINCIPALES
  // =========================

  /**
   * Muestra el detalle básico del trabajo (modal de lectura rápida).
   */
  async verDetalle(trabajo: Iagenda) {
    try {
      // 1) Seleccionar trabajo y limpiar estado visual
      this.trabajoAgenda = trabajo;
      this.trabajoTabla = this.trabajoAgenda;

      // 2) (Re)inicializa las imágenes para evitar que se vean las del item anterior
      this.imagenesInstalacion = {};

      // 3) Cargar imágenes de INSTALACIÓN por ord_ins (siempre)
      //    ⚠️ Usa la misma tabla que venías usando para descarga: 'neg_t_instalaciones'
      //    (si tu backend espera otra, cámbialo por la que corresponda)
      this.cargarImagenesInstalacion(
        'neg_t_instalaciones',
        String(trabajo.ord_ins)
      );

      // 4) Cargar info del cliente asociada a la orden
      this.clienteSeleccionado =
        await this.clientesService.getInfoServicioByOrdId(
          Number(trabajo.ord_ins)
        );

      // 5) Abrir modal
      const el = document.getElementById('detalleModal');
      if (el) new Modal(el).show();
    } catch (error) {
      console.error('Error al cargar detalle del soporte:', error);
    }
  }

  /**
   * Guarda la solución del trabajo:
   * - Actualiza la agenda (CONCLUIDO)
   * - Si no es INSTALACION, actualiza también VIS/LOS y/o SOPORTE
   * - Emite evento socket y refresca agenda
   */
  async guardarSolucion() {
    if (!this.trabajoAgenda) return;

    try {
      const body: Iagenda = {
        ...this.trabajoAgenda,
        age_estado: 'CONCLUIDO',
        age_solucion: this.trabajoAgenda.age_solucion,
      };

      // Mantiene tu llamada original (usa body.id)
      await this.agendaService.actualizarAgendaSolucion(body.id, body);

      // Si no es instalación, actualiza VIS/LOS y SOPORTE.
      if (this.trabajoAgenda.age_tipo !== 'INSTALACION') {
        // id de VIS/LOS: si no está en trabajoTabla, usar age_id_tipo
        const idVis = Number(
          this.trabajoTabla?.id ?? this.trabajoAgenda.age_id_tipo
        );
        await this.visService.updateVisById(
          idVis,
          'RESUELTO',
          this.trabajoAgenda.age_solucion
        );

        const bodySop = {
          reg_sop_estado: 'RESUELTO',
          reg_sop_sol_det: this.trabajoAgenda.age_solucion,
        };
        await this.soporteService.actualizarEstadoSop(
          this.trabajoAgenda.age_id_sop, // campo original
          bodySop
        );
      }

      // 🔄 Notificar por socket y recargar la agenda
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

  /**
   * Abre el modal de edición con datos completos:
   * - Cliente por ord_ins
   * - Define trabajoTabla según tipo (SOPORTE / VIS/LOS / INSTALACIÓN)
   * - Carga imágenes de instalación y visita
   */
  async abrirModalEditar(trabajo: Iagenda) {
    try {
      // 1) Datos del cliente por ORD_INS
      this.clienteSeleccionado =
        await this.clientesService.getInfoServicioByOrdId(
          Number(trabajo.ord_ins)
        );

      // 2) Seleccionar trabajo
      this.trabajoAgenda = { ...trabajo };

      this.cargarImagenesInstalacion(
        'neg_t_instalaciones',
        this.trabajoAgenda.ord_ins
      );
      this.cargarImagenesVisita('neg_t_vis', this.trabajoAgenda.age_id_tipo);

      // 3) trabajoTabla según tipo (para que guardarSolucion tenga IDs correctos)
      if (this.trabajoAgenda.age_tipo === 'SOPORTE') {
        this.trabajoTabla = await this.soporteService.getSopById(
          Number(this.trabajoAgenda.age_id_tipo)
        );
      } else if (
        this.trabajoAgenda.age_tipo === 'VISITA' ||
        this.trabajoAgenda.age_tipo === 'LOS'
      ) {
        // si no hay endpoint para VIS por id, al menos guardamos el id
        this.trabajoTabla = { id: Number(this.trabajoAgenda.age_id_tipo) };
      } else {
        // INSTALACION u otros
        this.trabajoTabla = this.trabajoAgenda;
      }

      // 4) Cargar imágenes (instalación y visita)
      this.cargarImagenesInstalacion(
        'neg_t_instalaciones',
        this.trabajoAgenda.ord_ins
      );
      this.cargarImagenesVisita('neg_t_vis', this.trabajoAgenda.age_id_tipo);

      // 5) Mostrar modal
      const el = document.getElementById('editarModal');
      if (el) new Modal(el).show();
    } catch (error) {
      console.error('❌ Error al cargar detalle del soporte:', error);
    }
  }

  // =========================
  // CARGA DE IMÁGENES (GET)
  // =========================

  /**
   * Descarga y setea las imágenes de instalación (tabla neg_t_instalaciones).
   * @param tabla  normalmente 'neg_t_instalaciones'
   * @param ord_ins ID de orden de instalación (string)
   */
  private cargarImagenesInstalacion(tabla: string, ord_ins: string): void {
    this.imagenesService.getImagenesByTableAndId(tabla, ord_ins).subscribe({
      next: (res: any) => {
        this.imagenesInstalacion = res?.imagenes ?? {};
      },
      error: (err) => {
        console.error('❌ Error cargando imágenes:', err);
        this.imagenesInstalacion = {};
      },
    });
  }

  /**
   * Descarga y setea las imágenes de visita/LOS (tabla neg_t_vis).
   * @param tabla  'neg_t_vis'
   * @param id     id del registro VIS/LOS (age_id_tipo)
   */
  private cargarImagenesVisita(tabla: string, id: string | number): void {
    this.imagenesService.getImagenesByTableAndId(tabla, String(id)).subscribe({
      next: (res: any) => {
        this.imagenesVisita = res?.imagenes ?? {};
      },
      error: (err) => {
        console.error('❌ Error cargando imágenes:', err);
        this.imagenesVisita = {};
      },
    });
  }

  /**
   * Abre el modal para ver una imagen en grande.
   */
  abrirImagenModal(url: string) {
    this.imagenSeleccionada = url;
    const el = document.getElementById('modalImagenAmpliada');
    if (el) new Modal(el).show();
  }

  // =========================
  // SUBIDA DE IMÁGENES (POST)
  // =========================

  /**
   * Subida de imágenes de "solución" para VIS/LOS (usa age_id_tipo como id y ord_ins como directorio).
   * Mantiene tu comportamiento original.
   */
  onImagenSolucionSeleccionada(event: Event, campo: string) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    if (!this.trabajoAgenda) {
      console.error('❌ No hay trabajo seleccionado.');
      return;
    }

    const imagen = input.files[0];
    const tabla = 'neg_t_vis';
    const id = this.trabajoAgenda.age_id_tipo; // id del registro VIS/LOS
    const directorio = this.trabajoAgenda.ord_ins; // agrupar por orden

    this.imagenesService
      .postImagenUnitaria(tabla, id, campo, imagen, directorio)
      .subscribe({
        next: () => {
          console.log(`✅ Imagen de solución (${campo}) subida`);
          this.cargarImagenesVisita(tabla, id); // Recarga VIS/LOS
        },
        error: (err) => {
          console.error(
            `❌ Error subiendo imagen de solución (${campo}):`,
            err
          );
        },
      });
  }

  /**
   * Alias para inputs que suben imágenes de instalación (ord_ins).
   */
  onImagenSeleccionada(event: Event, campo: string) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    if (!this.trabajoAgenda || !this.trabajoAgenda.ord_ins) {
      console.error('❌ No hay trabajo seleccionado o falta ord_ins.');
      return;
    }

    const archivo = input.files[0];

    // 🔒 SIEMPRE subir como INSTALACIÓN (aunque el trabajo sea VISITA/LOS)
    const tabla = 'neg_t_instalaciones';
    const id = this.trabajoAgenda.ord_ins; // clave en neg_t_instalaciones
    const directorio = this.trabajoAgenda.ord_ins; // carpeta por orden

    this.imagenesService
      .postImagenUnitaria(tabla, id, campo, archivo, directorio)
      .subscribe({
        next: () => {
          console.log(`✅ Imagen de instalación (${campo}) subida`);
          // Recargar grilla de instalación
          this.cargarImagenesInstalacion(tabla, id);
        },
        error: (err) => {
          console.error(
            `❌ Error subiendo imagen de instalación (${campo}):`,
            err
          );
        },
      });
  }

  // =========================
  // HELPERS DE VISTA
  // =========================

  /**
   * Valida si existe una imagen "usable" para el campo indicado.
   */
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
}
