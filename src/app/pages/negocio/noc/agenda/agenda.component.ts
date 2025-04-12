// ==========================
// AGENDA COMPONENT TS
// ==========================

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SoportesService } from '../../../../services/negocio_latacunga/soportes.service';
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
  //servicios
  soporteService = inject(SoportesService);
  clienteService = inject(ClientesService);
  usuariosService = inject(UsuariosService);
  agendaService = inject(AgendaService);

  //arrays
  tecnicosList: Iusuarios[] = [];
  agendaList: Iagenda[] = [];
  preAgendaList: Iagenda[] = [];

  //variables estrategicas
  idTecnico = 0;
  fechaTrabajoSeleccionada = '';
  fechaSeleccionada = this.obtenerFechaHoy();
  nombreDelDia = this.obtenerNombreDelDia(this.fechaSeleccionada);

  trabajoVista: Iagenda | null = null;
  trabajoSeleccionado: Iagenda | null = null;

  horaInicio = '';
  horaFin = '';
  vehiculoSeleccionado = '';
  modoEdicion = false;
  edicionHabilitada = true;

  horarios: string[] = [];

  agendaAsignada: { [hora: string]: { [vehiculo: string]: Iagenda | null } } =
    {};

  vehiculos = [
    { codigo: 'F17', nombre: 'F17 FURGONETA' },
    { codigo: 'F18', nombre: 'F18 CAMIONETA' },
    { codigo: 'F19', nombre: 'F19 CAMION' },
    { codigo: 'F20', nombre: 'F20 MOTO ROJA' },
  ];

  async ngOnInit() {
    this.generarHorarios();
    await this.cargarAgendaPorFecha();
    await this.cargarPreAgenda();
    this.tecnicosList = await this.usuariosService.getAllAgendaTecnicos();
  }

  async cargarAgendaPorFecha() {
    try {
      this.agendaList = await this.agendaService.getAgendaByDate(
        this.fechaSeleccionada
      );
      for (const item of this.agendaList) {
        try {
          if (item.age_ord_ins) {
            const servicio = await this.clienteService.getInfoServicioByOrdId(
              Number(item.age_ord_ins)
            );
            item.nombre_completo = servicio?.nombre_completo || '---';
          } else {
            item.nombre_completo = '---';
          }
        } catch {
          item.nombre_completo = '---';
        }
      }
      this.mapearAgendaDesdeBD();
      this.generarRenderAgenda();
      console.log(this.agendaList);
    } catch (error) {
      console.error('❌ Error al cargar la agenda por fecha:', error);
    }
  }

  async guardarAsignacionTrabajo() {
    if (
      !this.horaInicio ||
      !this.horaFin ||
      this.horaInicio >= this.horaFin ||
      !this.vehiculoSeleccionado
    ) {
      alert('Complete correctamente el horario y vehículo.');
      return;
    }

    const nombreTecnico =
      this.tecnicosList.find((t) => t.id === this.idTecnico)?.nombre || '';

    const body: Iagenda = {
      ...this.trabajoSeleccionado!,
      age_fecha: this.fechaTrabajoSeleccionada,
      age_hora_inicio: this.horaInicio,
      age_hora_fin: this.horaFin,
      age_vehiculo: this.vehiculoSeleccionado,
      //age_tecnico: nombreTecnico,
      age_tecnico: this.idTecnico,
    };

    const body_tec = {
      reg_sop_tec_asignado: this.idTecnico,
    };
    console.log(body);

    // await this.soporteService.actualizarTecnicoSop(
    //   this.trabajoSeleccionado!.age_id_sop,
    //   body_tec
    //);

    await this.agendaService.actualizarHorarioTrabajo(body.id, body);

    // 🔄 Refresca completamente el componente
    await this.ngOnInit();

    await this.cargarAgendaPorFecha();

    bootstrap.Modal.getInstance(
      document.getElementById('asignarModal')
    )?.hide();
  }

  async cargarPreAgenda() {
    this.preAgendaList = await this.agendaService.getPreAgenda();
    for (const item of this.preAgendaList) {
      try {
        const info = await this.clienteService.getInfoServicioByOrdId(
          Number(item.age_ord_ins)
        );
        item.nombre_completo = info?.nombre_completo || '---';
      } catch {
        item.nombre_completo = '---';
      }
    }
  }

  //FUNCIONES DE VISUALIZACION

  mapearAgendaDesdeBD() {
    for (const item of this.agendaList) {
      const inicioIndex = this.horarios.indexOf(item.age_hora_inicio);
      const finIndex = this.horarios.indexOf(item.age_hora_fin);
      if (inicioIndex === -1 || finIndex === -1) continue;
      for (let i = inicioIndex; i < finIndex; i++) {
        const hora = this.horarios[i];
        this.agendaAsignada[hora][item.age_vehiculo] = item;
      }
    }
  }

  generarRenderAgenda() {
    this.renderAgenda = {};
    for (const hora of this.horarios) {
      this.renderAgenda[hora] = {};
      for (const vehiculo of this.vehiculos) {
        this.renderAgenda[hora][vehiculo.codigo] = {
          trabajo: this.agendaAsignada[hora][vehiculo.codigo],
          rowspan: 1,
          mostrar: true,
        };
      }
    }
    for (const vehiculo of this.vehiculos) {
      let trabajoPrevio: Iagenda | null = null;
      let bloqueInicio: string | null = null;
      for (let i = 0; i < this.horarios.length; i++) {
        const hora = this.horarios[i];
        const actual = this.renderAgenda[hora][vehiculo.codigo].trabajo;
        if (trabajoPrevio && actual && actual.id === trabajoPrevio.id) {
          this.renderAgenda[hora][vehiculo.codigo].mostrar = false;
          if (bloqueInicio) {
            this.renderAgenda[bloqueInicio][vehiculo.codigo].rowspan++;
          }
        } else {
          bloqueInicio = hora;
        }
        trabajoPrevio = actual;
      }
    }
  }

  getEstadoClass(sub_tipo: string | undefined): string {
    switch (sub_tipo) {
      case 'LOS':
        return 'bg-yellow  text-black';
      case 'VISITA':
        return 'bg-blue text-white';
      case 'TRABAJO':
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

  renderAgenda: {
    [hora: string]: {
      [vehiculo: string]: {
        trabajo: Iagenda | null;
        rowspan: number;
        mostrar: boolean;
      };
    };
  } = {};

  //FUNCIONES DE FECHAS Y HORAS

  generarHorarios() {
    const inicio = 8 * 60;
    const fin = 18 * 60;
    const paso = 30;
    this.horarios = [];
    this.agendaAsignada = {};
    for (let min = inicio; min < fin; min += paso) {
      const hora = `${Math.floor(min / 60)
        .toString()
        .padStart(2, '0')}:${(min % 60).toString().padStart(2, '0')}`;
      this.horarios.push(hora);
      this.agendaAsignada[hora] = {};
      this.vehiculos.forEach(
        (v) => (this.agendaAsignada[hora][v.codigo] = null)
      );
    }
  }

  getFinHora(hora: string): string {
    const [h, m] = hora.split(':').map(Number);
    const totalMin = h * 60 + m + 30;
    return `${Math.floor(totalMin / 60)
      .toString()
      .padStart(2, '0')}:${(totalMin % 60).toString().padStart(2, '0')}`;
  }

  alCambiarFecha() {
    this.nombreDelDia = this.obtenerNombreDelDia(this.fechaSeleccionada);
    this.generarRangoHorarios();
    this.cargarAgendaPorFecha();
  }

  obtenerFechaHoy(): string {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${(hoy.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${hoy.getDate().toString().padStart(2, '0')}`;
  }

  obtenerNombreDelDia(fecha: string): string {
    const [a, m, d] = fecha.split('-').map(Number);
    return [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ][new Date(a, m - 1, d).getDay()];
  }

  generarRangoHorarios() {
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

  esFechaPasada(fecha: string | null | undefined): boolean {
    if (!fecha) return false;
    const hoy = new Date().setHours(0, 0, 0, 0);
    const fechaTrabajo = new Date(fecha).setHours(0, 0, 0, 0);
    return fechaTrabajo < hoy;
  }

  // FUNCIONES DE TECNICOS

  getNombreTecnicoPorId(id: any): string {
    const idNum = Number(id);
    if (!id || isNaN(idNum)) return 'No asignado';
    return (
      this.tecnicosList.find((t) => t.id === idNum)?.nombre || 'No asignado'
    );
  }

  //MODALES

  abrirModalAsignacion(trabajo: Iagenda) {
    this.trabajoSeleccionado = trabajo;
    this.horaInicio = '';
    this.horaFin = '';
    this.fechaTrabajoSeleccionada = this.obtenerFechaHoy();

    const modal = bootstrap.Modal.getOrCreateInstance(
      document.getElementById('asignarModal')
    );
    modal.show();
  }

  iniciarEdicionDesdeTabla(hora: string, vehiculo: string) {
    const trabajo = this.agendaAsignada[hora][vehiculo];
    if (!trabajo) return;

    this.trabajoSeleccionado = trabajo;
    this.fechaTrabajoSeleccionada = this.formatearFecha(trabajo.age_fecha);

    this.horaInicio = trabajo.age_hora_inicio;
    this.horaFin = trabajo.age_hora_fin;
    this.vehiculoSeleccionado = trabajo.age_vehiculo;
    this.idTecnico = trabajo.reg_sop_tec_asignado || 0;

    this.edicionHabilitada = !this.esFechaPasada(trabajo.age_fecha); // ❗️ aquí se evalúa

    bootstrap.Modal.getOrCreateInstance(
      document.getElementById('asignarModal')
    ).show();
  }

  formatearFecha(fecha: string | Date | null | undefined): string {
    if (!fecha) return this.obtenerFechaHoy(); // fallback por si es null
    const f = new Date(fecha);
    const y = f.getFullYear();
    const m = (f.getMonth() + 1).toString().padStart(2, '0');
    const d = f.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  abrirVistaDetalle(hora: string, vehiculo: string) {
    const trabajo = this.agendaAsignada[hora][vehiculo];
    if (!trabajo) return;
    this.trabajoVista = trabajo;
    bootstrap.Modal.getOrCreateInstance(
      document.getElementById('modalVistaSoporte')
    ).show();
  }

  asignarDesdePreagenda(trabajo: Iagenda) {
    this.trabajoSeleccionado = trabajo;
    this.fechaTrabajoSeleccionada = this.obtenerFechaHoy();
    this.horaInicio = '';
    this.horaFin = '';
    this.vehiculoSeleccionado = '';
    this.idTecnico = 0;
    this.modoEdicion = false;

    const modalPreagenda = bootstrap.Modal.getInstance(
      document.getElementById('modalSoportes')
    );
    modalPreagenda?.hide();

    setTimeout(() => {
      const modalAsignar = bootstrap.Modal.getOrCreateInstance(
        document.getElementById('asignarModal')
      );
      modalAsignar.show();
    });
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

  cerrarModalPreagenda() {
    bootstrap.Modal.getInstance(
      document.getElementById('modalSoportes')
    )?.hide();
  }
}
