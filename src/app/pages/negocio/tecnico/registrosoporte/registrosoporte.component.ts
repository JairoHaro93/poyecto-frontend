import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientesService } from '../../../../services/negocio_atuntaqui/clientes.service';
import { Iclientes } from '../../../../interfaces/negocio/clientes/iclientes.interface';

@Component({
  selector: 'app-registrosoporte',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './registrosoporte.component.html',
  styleUrl: './registrosoporte.component.css',
})
export class RegistrosoporteComponent {
  clienteService = inject(ClientesService);
  clientelista: Iclientes[] = [];
  busqueda: string = '';
  nombresFiltrados: string[] = [];
  clienteSeleccionado: Iclientes | null = null;

  async ngOnInit() {
    this.clientelista = await this.clienteService.getInfoClientes();
  }

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

  buscarClienteSeleccionado() {
    this.clienteSeleccionado =
      this.clientelista.find((c) => c.nombre_completo === this.busqueda) ||
      null;

    if (!this.clienteSeleccionado) {
      console.log('Cliente no encontrado');
    }
  }
}
