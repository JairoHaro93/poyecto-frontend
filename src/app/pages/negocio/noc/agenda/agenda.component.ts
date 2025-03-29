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
  soporteService = inject(SoportesService);
  clienteService = inject(ClientesService);
  usuariosService = inject(UsuariosService);
  agendaService = inject(AgendaService);

  tecnicosList: Iusuarios[] = [];
  agendaList: Iagenda[] = [];
  preAgendaList: Iagenda[] = [];

  idTecnico = 0;
  fechaSoporteSeleccionada = '';
  fechaSeleccionada = this.obtenerFechaHoy();
  nombreDelDia = this.obtenerNombreDelDia(this.fechaSeleccionada);

  trabajoVista: Iagenda | null = null;
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

  agendaAsignada: { [hora: string]: { [vehiculo: string]: Iagenda | null } } =
    {};

  async ngOnInit() {
    this.generarHorarios();
    await this.cargarAgendaPorFecha();
    await this.cargarPreAgenda();
    this.tecnicosList = await this.usuariosService.getAllAgendaTecnicos();
  }

  async cargarAgenda() {
    this.agendaList = await this.agendaService.getAgendaByDate(
      this.fechaSeleccionada
    );
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

    const modal = bootstrap.Modal.getOrCreateInstance(
      document.getElementById('asignarModal')
    );
    modal.show();
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
      age_fecha: this.fechaSoporteSeleccionada,
      age_hora_inicio: this.horaInicio,
      age_hora_fin: this.horaFin,
      age_vehiculo: this.vehiculoSeleccionado,
      age_tecnico: nombreTecnico,
    };

    await this.agendaService.actualizarHorarioTrabajo(body.id, body);
    await this.cargarAgenda();
    bootstrap.Modal.getInstance(
      document.getElementById('asignarModal')
    )?.hide();
  }

  mapearAgendaDesdeBD() {
    for (const item of this.agendaList) {
      const inicioIndex = this.horarios.indexOf(item.age_hora_inicio);
      const finIndex = this.horarios.indexOf(item.age_hora_fin);
      if (inicioIndex === -1 || finIndex === -1) continue;

      for (let i = inicioIndex; i < finIndex; i++) {
        const hora = this.horarios[i];
        this.agendaAsignada[hora][item.age_vehiculo] = item; // Se asigna directamente Iagenda
      }
    }
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

  cerrarModalPreagenda() {
    bootstrap.Modal.getInstance(
      document.getElementById('modalSoportes')
    )?.hide();
  }

  abrirVistaDetalle(hora: string, vehiculo: string) {
    const trabajo = this.agendaAsignada[hora][vehiculo];
    if (!trabajo) return;

    this.trabajoVista = trabajo;
    const modal = bootstrap.Modal.getOrCreateInstance(
      document.getElementById('modalVistaSoporte')
    );
    modal.show();
  }

  iniciarEdicionDesdeTabla(hora: string, vehiculo: string) {
    const trabajo = this.agendaAsignada[hora][vehiculo];
    if (!trabajo) return;

    this.trabajoSeleccionado = trabajo;

    this.fechaSoporteSeleccionada = trabajo.age_fecha;
    this.horaInicio = trabajo.age_hora_inicio;
    this.horaFin = trabajo.age_hora_fin;
    this.vehiculoSeleccionado = trabajo.age_vehiculo;
    this.idTecnico =
      this.tecnicosList.find((t) => t.nombre === trabajo.age_tecnico)?.id || 0;

    bootstrap.Modal.getOrCreateInstance(
      document.getElementById('asignarModal')
    ).show();
  }

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

  getEstadoClass(tipo: string | undefined): string {
    switch (tipo) {
      case 'S':
        return 'bg-yellow  text-black';
      case 'I':
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
    return `${Math.floor(totalMin / 60)
      .toString()
      .padStart(2, '0')}:${(totalMin % 60).toString().padStart(2, '0')}`;
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

  renderAgenda: {
    [hora: string]: {
      [vehiculo: string]: {
        trabajo: Iagenda | null;
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
    const fin = 18 * 60; // 6:00 pm en minutos
    const paso = 30; // Intervalo de 30 minutos

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

  async cargarAgendaPorFecha() {
    try {
      // 1. Obtener trabajos agendados por la fecha seleccionada
      this.agendaList = await this.agendaService.getAgendaByDate(
        this.fechaSeleccionada
      );

      // 2. Enriquecer con nombre del cliente usando age_ord_ins
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
        } catch (error) {
          console.warn(
            `❌ Error obteniendo info cliente para orden ${item.age_ord_ins}:`,
            error
          );
          item.nombre_completo = '---';
        }
      }

      // 3. Mapear trabajos agendados a la tabla visual
      this.mapearAgendaDesdeBD();

      // 4. Generar render con rowspan y visualización de celdas
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

  async asignarTecnicoASoporte() {
    if (!this.trabajoSeleccionado) return;
    const ord_ins = this.trabajoSeleccionado.age_id_sop;
    const body = { reg_sop_tec_asignado: this.idTecnico };
    try {
      await this.soporteService.actualizarTecnicoAsignado(ord_ins, body);
    } catch (error) {
      console.error('Error actualizando técnico:', error);
    }
  }

  asignarDesdePreagenda(trabajo: Iagenda) {
    this.trabajoSeleccionado = trabajo;
    this.fechaSoporteSeleccionada = this.obtenerFechaHoy();
    this.horaInicio = '';
    this.horaFin = '';
    this.vehiculoSeleccionado = '';
    this.idTecnico = 0;
    this.modoEdicion = false;

    // Primero cierra el modal de preagenda
    const modalPreagenda = bootstrap.Modal.getInstance(
      document.getElementById('modalSoportes')
    );
    modalPreagenda?.hide();

    // Luego abre el modal de asignación tras un pequeño retraso
    setTimeout(() => {
      const modalAsignar = bootstrap.Modal.getOrCreateInstance(
        document.getElementById('asignarModal')
      );
      modalAsignar.show();
    });
  }

  getNombreTecnicoPorId(id: number | null | undefined): string {
    if (!id) return 'No asignado';
    return this.tecnicosList.find((t) => t.id === id)?.nombre || 'No asignado';
  }
}
