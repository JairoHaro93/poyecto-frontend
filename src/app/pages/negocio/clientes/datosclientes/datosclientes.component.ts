import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientesService } from '../../../../services/negocio_atuntaqui/clientes.service';
import { Iclientes } from '../../../../interfaces/negocio/clientes/iclientes.interface';

@Component({
  selector: 'app-datosclientes',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './datosclientes.component.html',
  styleUrls: ['./datosclientes.component.css'],
})
export class DatosclientesComponent {
  clienteService = inject(ClientesService);
  clientelista: Iclientes[] = [];

  // Búsqueda por nombre
  busqueda: string = '';
  nombresFiltrados: string[] = [];

  // Búsqueda por cédula
  busquedaCedula: string = '';

  // Cliente seleccionado (se utiliza para actualizar ambos campos y obtener servicios)
  clienteSeleccionado: Iclientes | null = null;

  // Servicio seleccionado a través del radio button
  servicioSeleccionado: any = null;

  async ngOnInit() {
    this.clientelista = await this.clienteService.getInfoClientes();
  }

  // Actualiza las sugerencias para búsqueda por nombre
  actualizarSugerencias() {
    const texto = this.busqueda.trim().toLowerCase();
    if (texto.length > 0) {
      this.nombresFiltrados = this.clientelista
        .map((c) => c.nombre_completo)
        .filter((nombre) => nombre.toLowerCase().includes(texto));
    } else {
      this.nombresFiltrados = [];
    }
  }

  // Busca cliente por nombre y actualiza ambos campos
  buscarClienteSeleccionado() {
    this.clienteSeleccionado =
      this.clientelista.find((c) => c.nombre_completo === this.busqueda) ||
      null;
    if (
      this.clienteSeleccionado &&
      this.clienteSeleccionado.servicios?.length
    ) {
      // Se asigna el primer servicio por defecto.
      this.servicioSeleccionado = this.clienteSeleccionado.servicios[0];
    }

    if (this.clienteSeleccionado) {
      this.busqueda = this.clienteSeleccionado.nombre_completo;
      this.busquedaCedula = this.clienteSeleccionado.cedula;
    } else {
      console.log('Cliente no encontrado');
    }
  }

  // Busca cliente por cédula y actualiza ambos campos
  buscarClientePorCedula() {
    this.clienteSeleccionado =
      this.clientelista.find(
        (c) =>
          c.cedula.toLowerCase() === this.busquedaCedula.trim().toLowerCase()
      ) || null;
    if (
      this.clienteSeleccionado &&
      this.clienteSeleccionado.servicios?.length
    ) {
      // Se asigna el primer servicio por defecto.
      this.servicioSeleccionado = this.clienteSeleccionado.servicios[0];
    }

    if (this.clienteSeleccionado) {
      this.busqueda = this.clienteSeleccionado.nombre_completo;
      this.busquedaCedula = this.clienteSeleccionado.cedula;
    } else {
      console.log('Cliente no encontrado');
    }
  }

  // Método para seleccionar el nombre de la lista personalizada
  seleccionarNombre(nombre: string): void {
    this.busqueda = nombre;
    this.buscarClienteSeleccionado();
    this.nombresFiltrados = []; // Oculta la lista de sugerencias
  }

  copyIp(ip: string): void {
    navigator.clipboard
      .writeText(ip)
      .then(() => {
        console.log('IP copiada al portapapeles');
      })
      .catch((err) => {
        console.error('Error al copiar IP: ', err);
      });
  }
}
