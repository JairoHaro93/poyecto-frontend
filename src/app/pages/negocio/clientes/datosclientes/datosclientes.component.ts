import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientesService } from '../../../../services/negocio_atuntaqui/clientes.service';

interface ClienteBasico {
  cedula: string;
  nombre_completo: string;
}

@Component({
  selector: 'app-datosclientes',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './datosclientes.component.html',
  styleUrls: ['./datosclientes.component.css'],
})
export class DatosclientesComponent {
  clienteService = inject(ClientesService);

  clientelista: ClienteBasico[] = [];

  // Campos del formulario
  busqueda: string = ''; // nombre
  busquedaCedula: string = ''; // cédula
  nombresFiltrados: string[] = [];
  // Datos completos del cliente y sus servicios
  clienteSeleccionado: any = null;
  servicioSeleccionado: any = null;

  async ngOnInit() {
    try {
      this.clientelista = await this.clienteService.getInfoClientes(); // [{ cedula, nombre_completo }]
    } catch (error) {
      console.error('❌ Error al cargar clientes:', error);
    }
  }

  actualizarSugerencias() {
    const texto = this.busqueda.trim().toLowerCase();
    this.nombresFiltrados = texto
      ? this.clientelista
          .map((c) => c.nombre_completo)
          .filter((nombre) => nombre.toLowerCase().includes(texto))
      : [];
  }

  // Cuando selecciona un nombre
  async buscarClienteSeleccionado() {
    const cliente = this.clientelista.find(
      (c) =>
        c.nombre_completo.trim().toLowerCase() ===
        this.busqueda.trim().toLowerCase()
    );

    if (cliente) {
      this.busquedaCedula = cliente.cedula;
      this.nombresFiltrados = [];

      // 🔁 Carga los detalles como en búsqueda por cédula
      await this.cargarDetalleClientePorCedula();
    } else {
      this.busquedaCedula = '';
      this.clienteSeleccionado = null;
      this.servicioSeleccionado = null;
    }
  }

  // Cuando ingresa una cédula
  async buscarClientePorCedula() {
    const cedulaBuscada = this.busquedaCedula.trim();
    const cliente = this.clientelista.find((c) => c.cedula === cedulaBuscada);

    if (cliente) {
      this.busqueda = cliente.nombre_completo;
      this.nombresFiltrados = [];

      // 🔁 Llama al servicio para cargar detalles del cliente
      await this.cargarDetalleClientePorCedula();
    } else {
      this.busqueda = '';
      this.clienteSeleccionado = null;
      this.servicioSeleccionado = null;
    }
  }

  async seleccionarNombre(nombre: string) {
    this.busqueda = nombre;
    this.buscarClienteSeleccionado();
    this.nombresFiltrados = [];
  }

  // Carga el detalle completo del cliente por su cédula
  async cargarDetalleClientePorCedula() {
    const cedula = this.busquedaCedula.trim();
    if (!cedula) return;

    try {
      const detalle = await this.clienteService.getInfoClientesArray(cedula);
      console.log('Detalle recibido:', detalle);

      if (detalle.servicios.length > 0) {
        this.clienteSeleccionado = detalle;
        this.servicioSeleccionado = detalle.servicios[0];

        console.log('Servicios cargados:', this.clienteSeleccionado.servicios);
        console.log(
          'Servicio seleccionado:',
          this.servicioSeleccionado?.orden_instalacion
        );

        this.busqueda = this.clienteSeleccionado.nombre_completo;
      } else {
        this.clienteSeleccionado = null;
        this.servicioSeleccionado = null;
      }
    } catch (error) {
      console.error('❌ Error al cargar detalle del cliente:', error);
    }
  }
}
