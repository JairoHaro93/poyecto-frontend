import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SoportesService } from '../../../../services/negocio_latacunga/soportes.service';
import { Isoportes } from '../../../../interfaces/negocio/soportes/isoportes.interface';
import { UsuariosService } from '../../../../services/sistema/usuarios.service';
import { Iusuarios } from '../../../../interfaces/sistema/iusuarios.interface';

declare var bootstrap: any;

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.css',
})
export class AgendaComponent {
  soporteService = inject(SoportesService);
  soportesTec: Isoportes[] = [];
  usuariosService = inject(UsuariosService);
  tecnicosList: Iusuarios[] = [];
  idTecnico: number = 0;
  fechaSoporteSeleccionada: string = '';

  fechaSeleccionada: string = this.obtenerFechaHoy();
  nombreDelDia: string = this.obtenerNombreDelDia(this.fechaSeleccionada);

  soporteSeleccionado: Isoportes | null = null;
  horaInicio: string = '';
  horaFin: string = '';
  vehiculoSeleccionado: string = '';

  horarios: string[] = [];
  vehiculos = [
    { codigo: 'F17', nombre: 'F17 FURGONETA' },
    { codigo: 'F18', nombre: 'F18 CAMIONETA' },
    { codigo: 'F19', nombre: 'F19 CAMION' },
    { codigo: 'F20', nombre: 'F20 MOTO ROJA' },
  ];

  agendaAsignada: { [hora: string]: { [vehiculo: string]: Isoportes | null } } =
    {};

  async ngOnInit() {
    try {
      this.generarHorarios();
      this.cargarSoportes();
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    }
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

  abrirModal(soporte: Isoportes) {
    this.soporteSeleccionado = soporte;
    this.horaInicio = '';
    this.horaFin = '';
    this.fechaSoporteSeleccionada = this.obtenerFechaHoy(); // <- aquí
    const modalElement = document.getElementById('asignarModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  obtenerFechaHoy(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const day = hoy.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  obtenerNombreDelDia(fecha: string): string {
    const [a, m, d] = fecha.split('-').map(Number);
    const date = new Date(a, m - 1, d); // ⚠️ Mes empieza desde 0
    const dias = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];
    return dias[date.getDay()];
  }

  onFechaChange() {
    this.nombreDelDia = this.obtenerNombreDelDia(this.fechaSeleccionada);
    this.generarHorarios(); // opcional: recargar agenda para nueva fecha
  }

  confirmarAsignacion() {
    if (!this.horaInicio || !this.horaFin) {
      alert('Por favor seleccione ambas horas.');
      return;
    }

    if (this.horaInicio >= this.horaFin) {
      alert('La hora de inicio debe ser menor que la hora de fin.');
      return;
    }

    if (!this.vehiculoSeleccionado) {
      alert('Por favor seleccione un vehículo.');
      return;
    }

    const inicioIndex = this.horarios.indexOf(this.horaInicio);
    const finIndex = this.horarios.indexOf(this.horaFin);

    for (let i = inicioIndex; i < finIndex; i++) {
      const hora = this.horarios[i];
      this.agendaAsignada[hora][this.vehiculoSeleccionado] =
        this.soporteSeleccionado;
    }

    const modalElement = document.getElementById('asignarModal');
    const modal = bootstrap.Modal.getInstance(modalElement);

    modal.hide();
  }

  desasignar(hora: string, vehiculo: string) {
    this.agendaAsignada[hora][vehiculo] = null;
  }

  getEstadoClass(estado: string | undefined): string {
    switch (estado) {
      case 'LOS':
        return 'bg-orange text-white';
      case 'VISITA':
        return 'bg-blue text-white';
      case 'Pendiente':
        return 'bg-warning text-dark';
      case 'Asignado':
        return 'bg-primary text-white';
      case 'Completado':
        return 'bg-success text-white';
      case 'Cancelado':
        return 'bg-danger text-white';
      default:
        return 'bg-light text-muted';
    }
  }

  getFinHora(hora: string): string {
    const [h, m] = hora.split(':').map(Number);
    const totalMin = h * 60 + m + 30;
    const horas = Math.floor(totalMin / 60)
      .toString()
      .padStart(2, '0');
    const minutos = (totalMin % 60).toString().padStart(2, '0');
    return `${horas}:${minutos}`;
  }

  generarHorarios() {
    const inicio = 8 * 60;
    const fin = 18 * 60;
    const paso = 30;
    this.horarios = [];
    this.agendaAsignada = {};

    for (let min = inicio; min < fin; min += paso) {
      const horas = Math.floor(min / 60)
        .toString()
        .padStart(2, '0');
      const minutos = (min % 60).toString().padStart(2, '0');
      const hora = `${horas}:${minutos}`;
      this.horarios.push(hora);
      this.agendaAsignada[hora] = {};
      for (const veh of this.vehiculos) {
        this.agendaAsignada[hora][veh.codigo] = null;
      }
    }
  }

  async cargarSoportes() {
    try {
      this.soportesTec = await this.soporteService.getAllAsignarTecnicos();
      console.log(this.soportesTec);
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    }
  }

  async seleccionarTecnico() {
    console.log('Técnico seleccionado:', this.idTecnico);
    // Aquí puedes hacer lo que necesites con el id del técnico seleccionado

    const id = this.soporteSeleccionado!.id;
    const body = { reg_sop_tec_asignado: this.idTecnico };

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
