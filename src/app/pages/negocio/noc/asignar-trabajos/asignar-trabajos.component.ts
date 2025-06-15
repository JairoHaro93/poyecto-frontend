import { Component, inject } from '@angular/core';
import Swal from 'sweetalert2';
import { AgendaService } from '../../../../services/negocio_latacunga/agenda.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-asignar-trabajos',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './asignar-trabajos.component.html',
  styleUrl: './asignar-trabajos.component.css',
})
export class AsignarTrabajosComponent {
  agendaService = inject(AgendaService);
  private router = inject(Router);

  formData = {
    age_tipo: '',
    age_subtipo: '',
    age_coordenadas: '',
    age_observaciones: '',
  };

  agendar() {
    const bodyAge: any = {
      age_tipo: this.formData.age_tipo,
      age_subtipo: this.formData.age_subtipo,
      age_coordenadas: this.formData.age_coordenadas,
      age_observaciones: this.formData.age_observaciones,
    };

    if (
      this.formData.age_tipo === 'Trabajo' ||
      this.formData.age_tipo === 'Gestion'
    ) {
      bodyAge.ord_ins = 81177;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿AGREGAR EL SOPORTE A LA AGENDA?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, debe agregarse a la agenda',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await this.agendaService.postSopAgenda(bodyAge);
          console.log(bodyAge);
          this.router.navigateByUrl('/home/noc/soporte-tecnico');
        } catch (error) {
          console.error(error);
          Swal.fire({
            title: 'Error!',
            text: 'Ocurrió un error al cerrar el soporte.',
            icon: 'error',
          });
        }
      }
    });
  }
}
