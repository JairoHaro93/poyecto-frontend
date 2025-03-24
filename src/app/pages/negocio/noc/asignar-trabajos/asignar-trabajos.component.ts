import { Component, inject } from '@angular/core';
import { UsuariosService } from '../../../../services/sistema/usuarios.service';
import { Iusuarios } from '../../../../interfaces/sistema/iusuarios.interface';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SoportesService } from '../../../../services/negocio_latacunga/soportes.service';
import { Isoportes } from '../../../../interfaces/negocio/soportes/isoportes.interface';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-asignar-trabajos',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './asignar-trabajos.component.html',
  styleUrl: './asignar-trabajos.component.css',
})
export class AsignarTrabajosComponent {
  trabajoList = [
    { id: 1, trabajo: 'Asignar Soporte' },
    { id: 2, trabajo: 'Asignar Instalación' },
    { id: 3, trabajo: 'Asignar Nueva Instalación' },
  ];

  tecnicosList: Iusuarios[] = [];
  soportesTecnicosList: Isoportes[] = [];
  servicioSeleccionado: Isoportes | null = null;

  usuariosService = inject(UsuariosService);
  soporteService = inject(SoportesService);

  idTecnico: number = 0;

  async ngOnInit() {
    try {
      this.tecnicosList = await this.usuariosService.getAllAgendaTecnicos();
    } catch (error) {
      console.error('Error loading technicians:', error);
    }
  }

  selectTecnico(filterFormValue: any) {
    this.idTecnico = Number(filterFormValue.course_id);
    console.log('Selected Technician ID:', this.idTecnico);
  }

  async selectTrabajo(filterFormValue: any) {
    const idTrabajo = Number(filterFormValue.course_id);
    console.log('Selected Work Type ID:', idTrabajo);

    if (idTrabajo === 1) {
      try {
        this.soportesTecnicosList =
          await this.soporteService.getAllAsignarTecnicos();
        console.log('Support Jobs:', this.soportesTecnicosList);
      } catch (error) {
        console.error('Error loading support assignments:', error);
      }
    }
  }

  async guardarSolucion() {
    if (!this.servicioSeleccionado) {
      console.error('❌ No service selected.');
      return;
    }

    if (this.idTecnico === 0) {
      console.error('❌ No technician selected.');
      return;
    }

    const id = this.servicioSeleccionado.id;

    if (!id) {
      console.error('❌ Invalid Installation Order.');
      return;
    }

    const body = { reg_sop_tec_asignado: this.idTecnico };

    console.log('📌 Selected Installation Order:', id);
    console.log('👨‍🔧 Assigning Technician ID:', this.idTecnico);

    try {
      const response = await this.soporteService.actualizarTecnicoAsignado(
        id,
        body
      );
      console.log('✅ Technician successfully assigned!', response);
    } catch (error) {
      console.error('❌ Error updating assigned technician:', error);
    }
  }
}
