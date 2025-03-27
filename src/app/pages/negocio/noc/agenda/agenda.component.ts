import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SoportesService } from '../../../../services/negocio_latacunga/soportes.service';
import { Isoportes } from '../../../../interfaces/negocio/soportes/isoportes.interface';
import { UsuariosService } from '../../../../services/sistema/usuarios.service';
import { Iusuarios } from '../../../../interfaces/sistema/iusuarios.interface';
import { AgendaService } from '../../../../services/negocio_latacunga/agenda.service';
import { Iagenda } from '../../../../interfaces/negocio/agenda/iagenda.interface';

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
  usuariosService = inject(UsuariosService);
  agendaService = inject(AgendaService);

  soportesTec: Isoportes[] = [];
  tecnicosList: Iusuarios[] = [];
  agendaList: Iagenda[] = [];

  idTecnico: number = 0;
  fechaSoporteSeleccionada: string = '';
  fechaSeleccionada: string = this.obtenerFechaHoy();
  nombreDelDia: string = this.obtenerNombreDelDia(this.fechaSeleccionada);

  soporteVista: Isoportes | null = null;


  soporteSeleccionado: Isoportes | null = null;
  horaInicio: string = '';
  horaFin: string = '';
  vehiculoSeleccionado: string = '';
  modoEdicion: boolean = false;

  horarios: string[] = [];
  vehiculos = [
    { codigo: 'F17', nombre: 'F17 FURGONETA' },
    { codigo: 'F18', nombre: 'F18 CAMIONETA' },
    { codigo: 'F19', nombre: 'F19 CAMION' },
    { codigo: 'F20', nombre: 'F20 MOTO ROJA' },
  ];

  agendaAsignada: { [hora: string]: { [vehiculo: string]: Isoportes | null } } = {};

  async ngOnInit() {
    try {
      this.generarHorarios();
      this.agendaList = await this.agendaService.getAgendaByDate(this.fechaSeleccionada);
      this.asignarTrabajosDesdeBase();
      this.generarRenderAgenda();
      this.cargarSoportes();
      this.tecnicosList = await this.usuariosService.getAllAgendaTecnicos();
    } catch (error) {
      console.error('Error al cargar los datos:', error);
    }
  }

  async onFechaChange() {
    this.nombreDelDia = this.obtenerNombreDelDia(this.fechaSeleccionada);
    this.generarHorarios();
    try {
      this.agendaList = await this.agendaService.getAgendaByDate(this.fechaSeleccionada);
      this.asignarTrabajosDesdeBase();
      this.generarRenderAgenda();
    } catch (err) {
      console.error('Error al obtener la agenda:', err);
    }
  }

  abrirModal(soporte: Isoportes) {
    this.modoEdicion = false;
    this.soporteSeleccionado = soporte;
    this.horaInicio = '';
    this.horaFin = '';
    this.fechaSoporteSeleccionada = this.obtenerFechaHoy();
    const modal = new bootstrap.Modal(document.getElementById('asignarModal'));
    modal.show();
  }

  async confirmarAsignacion() {
    if (!this.horaInicio || !this.horaFin || this.horaInicio >= this.horaFin || !this.vehiculoSeleccionado) {
      alert('Complete correctamente el horario y vehículo.');
      return;
    }

    const inicioIndex = this.horarios.indexOf(this.horaInicio);
    const finIndex = this.horarios.indexOf(this.horaFin);

    const soporte = this.soporteSeleccionado!;
    const nombreTecnico = this.tecnicosList.find(t => t.id === this.idTecnico)?.nombre || '';

    const body: Iagenda = {
      id: soporte.id,
      age_nombre: soporte.reg_sop_nombre,
      age_coordenadas: soporte.reg_sop_coordenadas,
      age_fecha: this.fechaSoporteSeleccionada,
      age_hora_inicio: this.horaInicio,
      age_hora_fin: this.horaFin,
      age_vehiculo: this.vehiculoSeleccionado,
      age_tecnico: nombreTecnico,
    };

    try {
      const result = await this.agendaService.insertTrabajoEnAgenda(body);
      console.log('✅ Guardado en agenda:', result);

      const soporteVisual: Isoportes = {
        ...soporte,
        reg_sop_estado: 'Asignado',
        nombre_tecnico: nombreTecnico,
      };

      for (let i = inicioIndex; i < finIndex; i++) {
        const hora = this.horarios[i];
        this.agendaAsignada[hora][this.vehiculoSeleccionado] = soporteVisual;
      }

      bootstrap.Modal.getInstance(document.getElementById('asignarModal'))?.hide();
    } catch (error) {
      console.error('❌ Error al guardar la asignación en la base de datos', error);
    }
  }

  desasignar(hora: string, vehiculo: string) {
    this.agendaAsignada[hora][vehiculo] = null;
  }

  getEstadoClass(estado: string | undefined): string {
    switch (estado) {
      case 'LOS': return 'bg-orange text-white';
      case 'VISITA': return 'bg-blue text-white';
      case 'Pendiente': return 'bg-warning text-dark';
      case 'Asignado': return 'bg-primary text-white';
      case 'Completado': return 'bg-success text-white';
      case 'Cancelado': return 'bg-danger text-white';
      default: return 'bg-light text-muted';
    }
  }

  getFinHora(hora: string): string {
    const [h, m] = hora.split(':').map(Number);
    const totalMin = h * 60 + m + 30;
    const horas = Math.floor(totalMin / 60).toString().padStart(2, '0');
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
      const horas = Math.floor(min / 60).toString().padStart(2, '0');
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
    } catch (error) {
      console.error('Error al cargar los soportes:', error);
    }
  }

  async seleccionarTecnico() {
    if (!this.soporteSeleccionado) return;
    const id = this.soporteSeleccionado.id;
    const body = { reg_sop_tec_asignado: this.idTecnico };
    try {
      await this.soporteService.actualizarTecnicoAsignado(id, body);
    } catch (error) {
      console.error('Error actualizando técnico:', error);
    }
  }

  asignarTrabajosDesdeBase() {
    for (const item of this.agendaList) {
      const inicioIndex = this.horarios.indexOf(item.age_hora_inicio);
      const finIndex = this.horarios.indexOf(item.age_hora_fin);

      if (inicioIndex === -1 || finIndex === -1) continue;

      const soporteVisual: Isoportes = {
        id: item.id,
        ord_ins: 0,
        reg_sop_observaciones: '',
        cli_tel: '',
        reg_sop_opc: 0,
        reg_sop_registrado_por_id: '',
        reg_sop_registrado_por_nombre: '',
        reg_sop_fecha: new Date(item.age_fecha),
        reg_sop_fecha_acepta: new Date(item.age_fecha),
        reg_sop_nombre: item.age_nombre,
        reg_sop_estado: 'Asignado',
        reg_sop_tec_asignado: 0,
        nombre_tecnico: item.age_tecnico,
        reg_sop_noc_id_acepta: 0,
        reg_sop_sol_det: '',
        reg_sop_coordenadas: item.age_coordenadas,
      };

      for (let i = inicioIndex; i < finIndex; i++) {
        const hora = this.horarios[i];
        this.agendaAsignada[hora][item.age_vehiculo] = soporteVisual;
      }
    }
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
    const date = new Date(a, m - 1, d);
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[date.getDay()];
  }

  abrirEdicionDesdeTabla(hora: string, vehiculo: string) {
    const soporte = this.agendaAsignada[hora][vehiculo];
    if (!soporte) return;

    this.modoEdicion = true;
    this.soporteSeleccionado = soporte;
    this.fechaSoporteSeleccionada = this.fechaSeleccionada;
    this.horaInicio = hora;
    this.horaFin = this.getFinHora(hora);
    this.vehiculoSeleccionado = vehiculo;

    const tecnico = this.tecnicosList.find(t => t.nombre === soporte.nombre_tecnico);
    this.idTecnico = tecnico?.id || 0;

    const modal = new bootstrap.Modal(document.getElementById('asignarModal'));
    modal.show();
  }

  cerrarModalSoportes() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalSoportes'));
    modal?.hide();
  }

  renderAgenda: {
    [hora: string]: {
      [vehiculo: string]: {
        soporte: Isoportes | null;
        rowspan: number;
        mostrar: boolean;
      };
    };
  } = {};

  generarRenderAgenda() {
    this.renderAgenda = {};

    for (const hora of this.horarios) {
      this.renderAgenda[hora] = {};
      for (const vehiculo of this.vehiculos) {
        this.renderAgenda[hora][vehiculo.codigo] = {
          soporte: this.agendaAsignada[hora][vehiculo.codigo],
          rowspan: 1,
          mostrar: true,
        };
      }
    }

    for (const vehiculo of this.vehiculos) {
      let prevSoporte: Isoportes | null = null;
      let bloqueInicio: string | null = null;

      for (let i = 0; i < this.horarios.length; i++) {
        const hora = this.horarios[i];
        const actual = this.renderAgenda[hora][vehiculo.codigo].soporte;

        if (prevSoporte && actual && actual.id === prevSoporte.id) {
          this.renderAgenda[hora][vehiculo.codigo].mostrar = false;
          if (bloqueInicio) {
            this.renderAgenda[bloqueInicio][vehiculo.codigo].rowspan += 1;
          }
        } else {
          bloqueInicio = hora;
        }

        prevSoporte = actual;
      }
    }
  }
 
  abrirVistaDetalle(hora: string, vehiculo: string) {
    const soporte = this.agendaAsignada[hora][vehiculo];
    if (!soporte) return;
  
    this.soporteVista = soporte;
  
    const modal = new bootstrap.Modal(document.getElementById('modalVistaSoporte'));
    modal.show();
  }
 
}
