import { Component, inject } from '@angular/core';
import { Iagenda } from '../../../../interfaces/negocio/agenda/iagenda.interface';
import { AgendaService } from '../../../../services/negocio_latacunga/agenda.service';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { AutenticacionService } from '../../../../services/sistema/autenticacion.service';
import { DatePipe } from '@angular/common';
import { SoportesService } from '../../../../services/negocio_latacunga/soportes.service';

import { CommonModule } from '@angular/common';
import { Modal } from 'bootstrap'; // 👈 Asegúrate de tener Bootstrap 5
import { Isoportes } from '../../../../interfaces/negocio/soportes/isoportes.interface';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { io } from 'socket.io-client';

interface CustomPayload extends JwtPayload {
  usuario_id: number;
  usuario_usuario: string;
  usuario_rol: [];
  usuario_nombre: string;
}

@Component({
  selector: 'app-agendatecnicos',
  standalone: true,
  imports: [DatePipe, CommonModule, FormsModule],
  templateUrl: './agendatecnicos.component.html',
  styleUrl: './agendatecnicos.component.css',
})
export class AgendatecnicosComponent {
  agendaTecnicosList: Iagenda[] = [];
  datosUsuario: any;
  agendaService = inject(AgendaService);
  authService = inject(AutenticacionService);
  soporteService = inject(SoportesService);
  trabajoDetalle: Isoportes | null = null;
  trabajoSeleccionado: Iagenda | null = null;

  // Conexión con Socket.IO
  private socket = io(`${environment.API_WEBSOKETS_IO}`); // Conexión con WebSocket

  async ngOnInit() {
    try {
      this.datosUsuario = this.authService.datosLogged();
      const idtec = this.datosUsuario.usuario_id;
      console.log(idtec);

      this.agendaTecnicosList = await this.agendaService.getAgendaTec(idtec);
      console.log(this.agendaTecnicosList);

      // Escuchar el evento para actualizar la lista cuando otro usuario registre un soporte
      this.socket.on('trabajoAgendado', async () => {
        console.log(
          '🔄 Recibiendo actualización de trabajos en agendaTecnicosComponent'
        );
        this.agendaTecnicosList = await this.agendaService.getAgendaTec(idtec);
      });
    } catch (error) {
      console.error('Error al obtener la agenda del técnico', error);
    }
  }

  async verDetalle(trabajo: Iagenda) {
    try {
      this.trabajoSeleccionado = trabajo;

      if (this.trabajoSeleccionado.age_tipo === 'SOPORTE') {
        this.trabajoDetalle = null;
        this.trabajoDetalle = await this.soporteService.getSopById(
          Number(trabajo.age_id_sop)
        );
      }

      if (this.trabajoSeleccionado.age_tipo === 'TRABAJO') {
        this.trabajoDetalle = {
          reg_sop_nombre: 'REDECOM',
          reg_sop_opc: 0,
          reg_sop_fecha: this.trabajoSeleccionado.age_fecha,
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
    if (!this.trabajoSeleccionado) return;

    try {
      const body: Iagenda = {
        ...this.trabajoSeleccionado,
        age_estado: this.trabajoSeleccionado.age_estado,
        age_solucion: this.trabajoSeleccionado.age_solucion,
        // puedes incluir más campos aquí si estás editando también fecha/hora:
        // age_fecha: this.fechaTrabajoSeleccionada,
        // age_hora_inicio: this.horaInicio,
        // age_hora_fin: this.horaFin,
        // age_vehiculo: this.vehiculoSeleccionado,
        // age_tecnico: this.idTecnico,
      };

      console.log('el body' + body.id, body);

      await this.agendaService.actualizarAgendaSolucuion(body.id, body);

      // 🔄 Recargar toda la agenda actualizada desde el backend
      const idtec = this.datosUsuario?.usuario_id;
      if (idtec) {
        this.agendaTecnicosList = await this.agendaService.getAgendaTec(idtec);
      }
      // Confirmación visual
      window.alert('✅ Trabajo actualizado correctamente.');

      // Cerrar modal
      const modal = Modal.getInstance(document.getElementById('editarModal')!);
      modal?.hide();
    } catch (error) {
      console.error('❌ Error al actualizar trabajo:', error);
      window.alert('Error al guardar los cambios.');
    }
  }

  abrirModalEditar(trabajo: Iagenda) {
    this.trabajoSeleccionado = { ...trabajo }; // copia para evitar cambios directos si no se guarda
    const modal = new Modal(document.getElementById('editarModal')!);
    modal.show();
  }
}
