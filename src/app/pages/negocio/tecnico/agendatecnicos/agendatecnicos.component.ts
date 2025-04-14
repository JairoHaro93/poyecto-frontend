import { Component, inject } from '@angular/core';
import { Iagenda } from '../../../../interfaces/negocio/agenda/iagenda.interface';
import { AgendaService } from '../../../../services/negocio_latacunga/agenda.service';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { AutenticacionService } from '../../../../services/sistema/autenticacion.service';
import { DatePipe } from '@angular/common';

interface CustomPayload extends JwtPayload {
  usuario_id: number;
  usuario_usuario: string;
  usuario_rol: [];
  usuario_nombre: string;
}

@Component({
  selector: 'app-agendatecnicos',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './agendatecnicos.component.html',
  styleUrl: './agendatecnicos.component.css',
})
export class AgendatecnicosComponent {
  agendaTecnicosList: Iagenda[] = [];
  datosUsuario: any;
  agendaService = inject(AgendaService);
  authService = inject(AutenticacionService);

  async ngOnInit() {
    try {
      this.datosUsuario = this.authService.datosLogged();
      const idtec = this.datosUsuario.usuario_id;
      console.log(idtec);

      this.agendaTecnicosList = await this.agendaService.getAgendaTec(idtec);
      console.log(this.agendaTecnicosList);
    } catch (error) {
      console.error('Error al obtener la agenda del técnico', error);
    }
  }

  verDetalle(trabajo: Iagenda) {
    console.log('Ver detalle:', trabajo);
    // Aquí podrías abrir un modal o navegar a otra ruta
  }

  editarTrabajo(trabajo: Iagenda) {
    console.log('Editar trabajo:', trabajo);
    // Aquí podrías habilitar la edición o abrir un modal
  }
}
