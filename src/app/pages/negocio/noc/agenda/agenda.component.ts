// ==========================
// AGENDA COMPONENT TS
// ==========================

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SoportesService } from '../../../../services/negocio_latacunga/soportes.service';
import { Isoportes } from '../../../../interfaces/negocio/soportes/isoportes.interface';
import { UsuariosService } from '../../../../services/sistema/usuarios.service';
import { Iusuarios } from '../../../../interfaces/sistema/iusuarios.interface';
import { AgendaService } from '../../../../services/negocio_latacunga/agenda.service';
import { Iagenda } from '../../../../interfaces/negocio/agenda/iagenda.interface';
import { ClientesService } from '../../../../services/negocio_atuntaqui/clientes.service';

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
  clienteService = inject(ClientesService);
  usuariosService = inject(UsuariosService);
  agendaService = inject(AgendaService);

  soportesTec: Isoportes[] = [];
  tecnicosList: Iusuarios[] = [];
  agendaList: Iagenda[] = [];
  preAgendaList: Iagenda[] = [];

  idTecnico = 0;
  fechaSoporteSeleccionada = '';
  fechaSeleccionada = this.obtenerFechaHoy();
  nombreDelDia = this.obtenerNombreDelDia(this.fechaSeleccionada);

  soporteVista: Isoportes | null = null;
  trabajoSeleccionado: Iagenda | null = null;

  horaInicio = '';
  horaFin = '';
  vehiculoSeleccionado = '';
  modoEdicion = false;

  horarios: string[] = [];
  vehiculos = [
    { codigo: 'F17', nombre: 'F17 FURGONETA' },
    { codigo: 'F18', nombre: 'F18 CAMIONETA' },
    { codigo: 'F19', nombre: 'F19 CAMION' },
    { codigo: 'F20', nombre: 'F20 MOTO ROJA' },
  ];

  agendaAsignada: { [hora: string]: { [vehiculo: string]: Isoportes | null } } = {};

  async ngOnInit() {
    this.generarHorarios();
    await this.cargarAgenda();
    await this.cargarPreAgenda();
    this.tecnicosList = await this.usuariosService.getAllAgendaTecnicos();
  }

  async cargarAgenda() {
    this.agendaList = await this.agendaService.getAgendaByDate(this.fechaSeleccionada);
    this.mapearAgendaDesdeBD();
    this.generarRenderAgenda();
  }

  async onFechaChange() {
    this.nombreDelDia = this.obtenerNombreDelDia(this.fechaSeleccionada);
    this.generarHorarios();
    await this.cargarAgenda();
  }

  abrirModalAsignacion(trabajo: Iagenda) {
    this.modoEdicion = false;
    this.trabajoSeleccionado = trabajo;
    this.horaInicio = '';
    this.horaFin = '';
    this.fechaSoporteSeleccionada = this.obtenerFechaHoy();

    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('asignarModal'));
    modal.show();
  }

  async guardarAsignacionTrabajo() {
    if (!this.horaInicio || !this.horaFin || this.horaInicio >= this.horaFin || !this.vehiculoSeleccionado) {
      alert('Complete correctamente el horario y vehículo.');
      return;
    }

    const nombreTecnico = this.tecnicosList.find(t => t.id === this.idTecnico)?.nombre || '';
    const body: Iagenda = {
      ...this.trabajoSeleccionado!,
      age_fecha: this.fechaSoporteSeleccionada,
      age_hora_inicio: this.horaInicio,
      age_hora_fin: this.horaFin,
      age_vehiculo: this.vehiculoSeleccionado,
      age_tecnico: nombreTecnico,
    };

    await this.agendaService.actualizarHorarioTrabajo(body.id, body);
    await this.cargarAgenda();
    bootstrap.Modal.getInstance(document.getElementById('asignarModal'))?.hide();
  }

  mapearAgendaDesdeBD() {
    for (const item of this.agendaList) {
      const inicioIndex = this.horarios.indexOf(item.age_hora_inicio);
      const finIndex = this.horarios.indexOf(item.age_hora_fin);
      if (inicioIndex === -1 || finIndex === -1) continue;

      const soporte: Isoportes = {
        id: item.id,
        ord_ins: Number(item.age_ord_tra),
        reg_sop_nombre: item.age_tipo,
        nombre_tecnico: item.age_tecnico,
        cli_tel: item.cli_tel,
        reg_sop_estado: 'Asignado',
        reg_sop_coordenadas: item.reg_sop_coordenadas || item.age_coordenadas,
        reg_sop_fecha: new Date(item.age_fecha),
        reg_sop_fecha_acepta: new Date(item.age_fecha),
        reg_sop_observaciones: '',
        reg_sop_opc: 0,
        reg_sop_registrado_por_id: '',
        reg_sop_registrado_por_nombre: '',
        reg_sop_tec_asignado: 0,
        reg_sop_noc_id_acepta: 0,
        reg_sop_sol_det: '',
      };

      for (let i = inicioIndex; i < finIndex; i++) {
        const hora = this.horarios[i];
        this.agendaAsignada[hora][item.age_vehiculo] = soporte;
      }
    }
  }

  async cargarPreAgenda() {
    this.preAgendaList = await this.agendaService.getPreAgenda();

    for (const item of this.preAgendaList) {
      try {
        const info = await this.clienteService.getInfoServicioByOrdId(Number(item.age_ord_ins));
        item.nombre_completo = info?.nombre_completo || '---';
      } catch {
        item.nombre_completo = '---';
      }
    }
  }

  cerrarModalPreagenda() {
    bootstrap.Modal.getInstance(document.getElementById('modalSoportes'))?.hide();
  }

  abrirVistaDetalle(hora: string, vehiculo: string) {
    const soporte = this.agendaAsignada[hora][vehiculo];
    if (!soporte) return;
    this.soporteVista = soporte;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalVistaSoporte')).show();
  }

  iniciarEdicionDesdeTabla(hora: string, vehiculo: string) {
    const soporte = this.agendaAsignada[hora][vehiculo];
    if (!soporte) return;

    this.trabajoSeleccionado = {
      id: soporte.id,
      age_tipo: soporte.reg_sop_nombre,
      age_ord_tra: '',
      age_ord_ins: '',
      age_id_sop: '',
      age_coordenadas: soporte.reg_sop_coordenadas,
      age_fecha: this.fechaSeleccionada,
      age_hora_inicio: hora,
      age_hora_fin: this.getFinHora(hora),
      age_vehiculo: vehiculo,
      age_tecnico: soporte.nombre_tecnico,
      cli_tel: soporte.cli_tel,
      reg_sop_coordenadas: soporte.reg_sop_coordenadas,
    };

    this.fechaSoporteSeleccionada = this.fechaSeleccionada;
    this.horaInicio = hora;
    this.horaFin = this.getFinHora(hora);
    this.vehiculoSeleccionado = vehiculo;
    this.idTecnico = this.tecnicosList.find(t => t.nombre === soporte.nombre_tecnico)?.id || 0;

    bootstrap.Modal.getOrCreateInstance(document.getElementById('asignarModal')).show();
  }

  generarHorarios() {
    const inicio = 8 * 60;
    const fin = 18 * 60;
    const paso = 30;
    this.horarios = [];
    this.agendaAsignada = {};

    for (let min = inicio; min < fin; min += paso) {
      const hora = `${Math.floor(min / 60).toString().padStart(2, '0')}:${(min % 60).toString().padStart(2, '0')}`;
      this.horarios.push(hora);
      this.agendaAsignada[hora] = {};
      this.vehiculos.forEach(v => this.agendaAsignada[hora][v.codigo] = null);
    }
  }

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
      let prev: Isoportes | null = null;
      let bloqueInicio: string | null = null;

      for (let i = 0; i < this.horarios.length; i++) {
        const hora = this.horarios[i];
        const actual = this.renderAgenda[hora][vehiculo.codigo].soporte;

        if (prev && actual && actual.id === prev.id) {
          this.renderAgenda[hora][vehiculo.codigo].mostrar = false;
          if (bloqueInicio) this.renderAgenda[bloqueInicio][vehiculo.codigo].rowspan++;
        } else {
          bloqueInicio = hora;
        }
        prev = actual;
      }
    }
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
    return `${Math.floor(totalMin / 60).toString().padStart(2, '0')}:${(totalMin % 60).toString().padStart(2, '0')}`;
  }

  obtenerFechaHoy(): string {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${(hoy.getMonth() + 1).toString().padStart(2, '0')}-${hoy.getDate().toString().padStart(2, '0')}`;
  }

  obtenerNombreDelDia(fecha: string): string {
    const [a, m, d] = fecha.split('-').map(Number);
    return ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][new Date(a, m - 1, d).getDay()];
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

  alCambiarFecha() {
    this.nombreDelDia = this.obtenerNombreDelDia(this.fechaSeleccionada);
    this.generarRangoHorarios();
    this.cargarAgendaPorFecha();
  }
  
  generarRangoHorarios() {
    const inicio = 8 * 60; // 8:00 am en minutos
    const fin = 18 * 60;   // 6:00 pm en minutos
    const paso = 30;       // Intervalo de 30 minutos
  
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

  async cargarAgendaPorFecha() {
    try {
      // Obtener la agenda desde el servicio según la fecha seleccionada
      this.agendaList = await this.agendaService.getAgendaByDate(this.fechaSeleccionada);
  
      // Mapear los trabajos agendados a la tabla visual
      this.mapearAgendaDesdeBD();
  
      // Generar la tabla con celdas combinadas
      this.generarRenderAgenda();
    } catch (error) {
      console.error('❌ Error al cargar la agenda por fecha:', error);
    }
  }

  abrirModalPreagenda() {
    const element = document.getElementById('modalSoportes');
    if (element) {
      const modal = bootstrap.Modal.getOrCreateInstance(element);
      modal.show();
    } else {
      console.warn('❌ Modal #modalSoportes no encontrado en el DOM');
    }
  }
  
  getEstadoClaseColor(estado: string | undefined): string {
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
  
  async asignarTecnicoASoporte() {
    if (!this.trabajoSeleccionado) return;
    const id = this.trabajoSeleccionado.id;
    const body = { reg_sop_tec_asignado: this.idTecnico };
    try {
      await this.soporteService.actualizarTecnicoAsignado(id, body);
    } catch (error) {
      console.error('Error actualizando técnico:', error);
    }
  }
  
  
}
