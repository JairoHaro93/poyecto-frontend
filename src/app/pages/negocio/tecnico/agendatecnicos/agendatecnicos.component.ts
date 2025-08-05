import { Component, inject } from '@angular/core';
import { Iagenda } from '../../../../interfaces/negocio/agenda/iagenda.interface';
import { AgendaService } from '../../../../services/negocio_latacunga/agenda.service';
import { AutenticacionService } from '../../../../services/sistema/autenticacion.service';
import { DatePipe } from '@angular/common';
import { SoportesService } from '../../../../services/negocio_latacunga/soportes.service';

import { CommonModule } from '@angular/common';
import { Modal } from 'bootstrap'; // 👈 Asegúrate de tener Bootstrap 5
import { Isoportes } from '../../../../interfaces/negocio/soportes/isoportes.interface';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { io } from 'socket.io-client';
import Swal from 'sweetalert2';
import { Iusuarios } from '../../../../interfaces/sistema/iusuarios.interface';
import { SoketService } from '../../../../services/socket_io/soket.service';
import { ImagenesService } from '../../../../services/negocio_latacunga/imagenes.service';
import { VisService } from '../../../../services/negocio_latacunga/vis.service';
import { IVis } from '../../../../interfaces/negocio/vis/vis.interface';
import { ClientesService } from '../../../../services/negocio_atuntaqui/clientes.service';
import { Iclientes } from '../../../../interfaces/negocio/clientes/iclientes.interface';

@Component({
  selector: 'app-agendatecnicos',
  standalone: true,
  imports: [DatePipe, CommonModule, FormsModule],
  templateUrl: './agendatecnicos.component.html',
  styleUrl: './agendatecnicos.component.css',
})
export class AgendatecnicosComponent {
  agendaTecnicosList: Iagenda[] = [];
  datosUsuario!: Iusuarios;
  agendaService = inject(AgendaService);
  authService = inject(AutenticacionService);
  soporteService = inject(SoportesService);
  visService = inject(VisService);
  clientesService = inject(ClientesService);
  imagenesService = inject(ImagenesService);
  trabajoTabla: any;
  trabajoAgenda: Iagenda | null = null;
  //imagenesInstalacion: { [key: string]: { ruta: string; url: string } } = {};
  imagenSeleccionada: string | null = null;
  clienteSeleccionado: Iclientes = {} as Iclientes;
  // Lista de campos de imagen esperados
  comentarioCliente = null;
  camposImagen: string[] = [
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

  // Objeto para almacenar las imágenes actuales
  imagenesInstalacion: Record<string, { url: string; ruta: string }> = {};

  imagenesVisita: Record<string, { url: string; ruta: string }> = {};

  // Objeto temporal para archivos seleccionados por campo
  imagenesSeleccionadas: Record<string, File> = {};

  // Conexión con Socket.IO
  private socketService = inject(SoketService);

  async ngOnInit() {
    try {
      this.datosUsuario = await this.authService.getUsuarioAutenticado();
      const idtec = this.datosUsuario.id;

      this.socketService.on('trabajoAgendadoTecnico', async () => {
        console.log('📥 Trabajo agendado para este técnico');
        this.agendaTecnicosList = await this.agendaService.getAgendaTec(idtec!);
      });

      this.agendaTecnicosList = await this.agendaService.getAgendaTec(idtec!);
    } catch (error) {
      console.error('❌ Error al obtener la agenda del técnico', error);
    }
  }

  async verDetalle(trabajo: Iagenda) {
    try {
      this.trabajoAgenda = trabajo;

      if (
        this.trabajoAgenda.age_tipo === 'LOS' ||
        this.trabajoAgenda.age_tipo === 'VISITA'
      ) {
        this.trabajoTabla = null;
        this.trabajoTabla = await this.visService.getVisById(
          Number(trabajo.age_id_tipo)
        );
        this.comentarioCliente = this.trabajoTabla.vis_coment_cliente;
        console.log(this.trabajoTabla);
      }
      this.cargarImagenesInstalacion('neg_t_instalaciones', trabajo.ord_ins);

      this.clienteSeleccionado =
        await this.clientesService.getInfoServicioByOrdId(
          Number(trabajo.ord_ins)
        );

      console.log(this.clienteSeleccionado);
      if (this.trabajoAgenda.age_tipo === 'INSTALACION') {
        this.trabajoTabla = {
          reg_sop_nombre: 'REDECOM',
          reg_sop_opc: 0,
          reg_sop_fecha: this.trabajoAgenda.age_fecha,
          reg_sop_sol_det: 'Trabajo interno',
          tipo_soporte: 'Trabajo',
          reg_sop_coordenadas: '',
          descripcion: '',
          // agrega aquí el resto de campos que requiere tu template
        } as unknown as Isoportes;
      }

      const modal = new Modal(document.getElementById('detalleModal')!);
      modal.show();
    } catch (error) {
      console.error('Error al cargar detalle del soporte:', error);
    }
  }

  editarTrabajo(trabajo: Iagenda) {
    console.log('Editar trabajo:', trabajo);

    // Aquí podrías habilitar la edición o abrir un modal
  }

  async guardarSolucion() {
    if (!this.trabajoAgenda) return;

    try {
      const body: Iagenda = {
        ...this.trabajoAgenda,
        age_estado: 'CONCLUIDO',
        age_solucion: this.trabajoAgenda.age_solucion,
      };

      const body_sop = {
        reg_sop_estado: 'RESUELTO',
        reg_sop_sol_det: this.trabajoAgenda.age_solucion,
      };
      console.log(this.trabajoTabla.id);
      let vis_estado = 'RESUELTO';
      await this.agendaService.actualizarAgendaSolucuion(body.id, body);
      if (this.trabajoAgenda.age_tipo !== 'INSTALACION') {
        await this.visService.updateVisById(
          this.trabajoTabla.id,
          vis_estado,
          this.trabajoAgenda.age_solucion
        );

        await this.soporteService.actualizarEstadoSop(
          this.trabajoAgenda.age_id_sop,
          body_sop
        );
      }

      console.log(this.trabajoAgenda.age_id_sop);

      // 🔄 Emitir evento de trabajo resuelto
      this.socketService.emit('trabajoCulminado', {
        tecnicoId: this.datosUsuario.id,
      });

      // 🔄 Recargar la agenda
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

      const modal = Modal.getInstance(document.getElementById('editarModal')!);
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

  private cargarImagenesInstalacion(tabla: string, ord_ins: string): void {
    this.imagenesService.getImagenesPorTrabajo(tabla, ord_ins).subscribe({
      next: (res: any) => {
        if (res?.imagenes) {
          this.imagenesInstalacion = res.imagenes;
        } else {
          this.imagenesInstalacion = {};
        }
      },
      error: (err) => {
        console.error('❌ Error cargando imágenes:', err);
        this.imagenesInstalacion = {};
      },
    });
  }

  private cargarImagenesVisita(tabla: string, ord_ins: string): void {
    this.imagenesService.getImagenesPorTrabajo(tabla, ord_ins).subscribe({
      next: (res: any) => {
        if (res?.imagenes) {
          this.imagenesVisita = res.imagenes;
        } else {
          this.imagenesVisita = {};
        }
      },
      error: (err) => {
        console.error('❌ Error cargando imágenes:', err);
        this.imagenesVisita = {};
      },
    });
  }

  abrirImagenModal(url: string) {
    this.imagenSeleccionada = url;
    const modal = new Modal(document.getElementById('modalImagenAmpliada')!);
    modal.show();
  }

  async abrirModalEditar(trabajo: Iagenda) {
    try {
      this.clienteSeleccionado =
        await this.clientesService.getInfoServicioByOrdId(
          Number(trabajo.ord_ins)
        );
      console.log(this.clienteSeleccionado);
      // Asignar el trabajo seleccionado antes de usarlo
      this.trabajoAgenda = { ...trabajo };

      // Cargar datos adicionales si es un soporte
      if (this.trabajoAgenda.age_tipo === 'SOPORTE') {
        this.trabajoTabla = await this.soporteService.getSopById(
          Number(this.trabajoAgenda.age_id_tipo)
        );
      }

      // Si es un trabajo interno
      if (this.trabajoAgenda.age_tipo === 'TRABAJO') {
        this.trabajoTabla = {
          // reg_sop_nombre: 'REDECOM',
          reg_sop_opc: 0,
          reg_sop_fecha: this.trabajoAgenda.age_fecha,
          reg_sop_sol_det: 'Trabajo interno',
          tipo_soporte: 'Trabajo',
          reg_sop_coordenadas: '',
          descripcion: '',
          // agrega más campos si es necesario
        } as unknown as Isoportes;
      }

      // Cargar imágenes
      this.cargarImagenesInstalacion(
        'neg_t_instalaciones',
        this.trabajoAgenda.ord_ins
      );
      this.cargarImagenesVisita('neg_t_vis', this.trabajoAgenda.age_id_tipo);

      // Mostrar el modal de edición
      const modal = new Modal(document.getElementById('editarModal')!);
      modal.show();
    } catch (error) {
      console.error('❌ Error al cargar detalle del soporte:', error);
    }
  }

  async subirImagen(event: Event, campo: string) {
    let tabla = '';

    switch (this.trabajoAgenda?.age_tipo) {
      case 'LOS':
        tabla = 'neg_t_vis';
        break;
      case 'VISITA':
        tabla = 'neg_t_vis';
        break;
      case 'INSTALACION':
        tabla = 'neg_t_instalaciones';
        break;
      default:
        tabla = ''; // opcional, en caso de valor no reconocido
        break;
    }

    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const archivo = input.files[0];

    if (!this.trabajoAgenda || !this.trabajoAgenda.ord_ins) {
      console.error('❌ Trabajo no seleccionado o falta ID de orden.');
      return;
    }

    const id = this.trabajoAgenda.ord_ins;
    const directorio = this.trabajoAgenda.ord_ins;

    this.imagenesService
      .postImagenesPorTrabajo(tabla, id, campo, archivo, directorio)
      .subscribe({
        next: (res) => {
          console.log('✅ Imagen subida:', res);
          this.cargarImagenesInstalacion(tabla, id); // recarga imágenes
          //this.cargarImagenesVisita('neg_t_agenda',this.trabajoAgenda!.age_id_tipo); // recarga también de visitas
        },
        error: (err) => {
          console.error('❌ Error al subir imagen:', err);
        },
      });
  }

  onImagenSolucionSeleccionada(event: Event, campo: string) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const imagen = input.files[0];

    // Asegurarse de que el trabajo esté seleccionado
    if (!this.trabajoAgenda) {
      console.error('❌ No hay trabajo seleccionado.');
      return;
    }

    const id = this.trabajoAgenda.age_id_tipo;
    const directorio = this.trabajoAgenda.ord_ins;
    let tabla = '';

    switch (this.trabajoAgenda?.age_tipo) {
      case 'LOS':
        tabla = 'neg_t_vis';
        break;
      case 'VISITA':
        tabla = 'neg_t_vis';
        break;
      default:
        tabla = ''; // opcional, en caso de valor no reconocido
        break;
    }

    this.imagenesService
      .postImagenesPorTrabajo(tabla, id, campo, imagen, directorio)
      .subscribe({
        next: () => {
          console.log(`✅ Imagen ${campo} subida con éxito`);
          this.cargarImagenesVisita(tabla, id); // Recarga solo las de agenda
        },
        error: (err) => {
          console.error(`❌ Error subiendo imagen ${campo}:`, err);
        },
      });
  }

  onImagenSeleccionada(event: Event, campo: string) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const archivo = input.files[0];

    if (!this.trabajoAgenda) {
      console.error('❌ No hay trabajo seleccionado');
      return;
    }

    const id = this.trabajoAgenda.ord_ins; // Este es el ID a comparar en 'neg_t_instalaciones';

    const directorio = this.trabajoAgenda.ord_ins;
    let tabla = 'neg_t_instalaciones';

    this.imagenesService
      .postImagenesPorTrabajo(tabla, id, campo, archivo, directorio)
      .subscribe({
        next: (res) => {
          console.log(`✅ Imagen ${campo} subida con éxito`);
          this.cargarImagenesInstalacion(tabla, id); // Refresca instalación
        },
        error: (err) => {
          console.error(`❌ Error al subir la imagen ${campo}:`, err);
        },
      });
  }

  esImagenValida(campo: string): boolean {
    const img = this.imagenesInstalacion[campo];
    return img && img.ruta !== 'null' && img.url !== 'undefined/imagenes/null';
  }
}
