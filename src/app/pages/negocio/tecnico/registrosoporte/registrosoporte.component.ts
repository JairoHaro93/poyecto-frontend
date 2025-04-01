import { Component, EventEmitter, inject, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientesService } from '../../../../services/negocio_atuntaqui/clientes.service';
import { Iclientes } from '../../../../interfaces/negocio/clientes/iclientes.interface';
import { Isoportes } from '../../../../interfaces/negocio/soportes/isoportes.interface';
import { AutenticacionService } from '../../../../services/sistema/autenticacion.service';
import { SoportesService } from '../../../../services/negocio_latacunga/soportes.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { io } from 'socket.io-client';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-registrosoporte',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './registrosoporte.component.html',
  styleUrl: './registrosoporte.component.css',
})
export class RegistrosoporteComponent {
  clienteService = inject(ClientesService);
  authService = inject(AutenticacionService);
  soporteService = inject(SoportesService);
  private router = inject(Router);

  clientelista: Iclientes[] = [];
  soportesPendientes: Isoportes[] = [];
  SoporteForm2: FormGroup;
  datosUsuario: any;

  // Conexión con Socket.IO

  private socket = io(`${environment.API_WEBSOKETS_IO}`); // Conexión con WebSocket

  // Búsquedas
  busqueda: string = '';
  nombresFiltrados: string[] = [];
  busquedaCedula: string = '';
  clienteSeleccionado: Iclientes | null = null;
  servicioSeleccionado: any = null;

  @Output() nuevoSoporte: EventEmitter<Isoportes> = new EventEmitter();

  constructor() {
    this.SoporteForm2 = new FormGroup({
      reg_sop_coordenadas: new FormControl(null, []),
      ord_ins: new FormControl(null, []),
      reg_sop_observaciones: new FormControl(null, []),
      cli_tel: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]{10,}$'),
      ]),
      reg_sop_opc: new FormControl(null, [Validators.required]),
      reg_sop_registrado_por_id: new FormControl('', []),
      reg_sop_nombre: new FormControl('', []),
    });
  }

  async ngOnInit() {
    this.clientelista = await this.clienteService.getInfoClientes();
    this.datosUsuario = this.authService.datosLogged();
    await this.cargarSoportesPendientes();

    // Escuchar el evento para actualizar la lista cuando otro usuario registre un soporte
    this.socket.on('actualizarSoportes', async () => {
      console.log(
        '🔄 Recibiendo actualización de soportes en RegistrosoporteComponent'
      );
      await this.cargarSoportesPendientes();
    });
  }

  async cargarSoportesPendientes() {
    this.soportesPendientes = await this.soporteService.getAllPendientes();
  }

  async getDataForm2() {
    if (this.SoporteForm2.valid) {
      this.SoporteForm2.patchValue({
        reg_sop_nombre: this.clienteSeleccionado?.nombre_completo,
        ord_ins: this.servicioSeleccionado?.orden_instalacion || null,
        reg_sop_coordenadas: this.servicioSeleccionado?.coordenadas || null,
        reg_sop_registrado_por_id: this.datosUsuario.usuario_id,
      });

      console.log('Formulario válido:', this.SoporteForm2.value);

      const SoporteData = this.SoporteForm2.value;
      try {
        const response = await this.soporteService.createSop(SoporteData);
        Swal.fire('Realizado', 'Orden de Soporte Creado', 'success');

        // Emitir evento de actualización de soportes a través de WebSocket
        this.socket.emit('soporteCreado');

        await this.cargarSoportesPendientes();
        this.resetDatosGenerales();
      } catch ({ error }: any) {
        Swal.fire('Error guardando soporte', error.message, 'error');
      }
    } else {
      console.log('Formulario inválido, revise los campos.');
      this.SoporteForm2.markAllAsTouched();
    }
  }

  resetDatosGenerales() {
    this.busqueda = '';
    this.busquedaCedula = '';
    this.nombresFiltrados = [];
    this.clienteSeleccionado = null;
    this.servicioSeleccionado = null;
    this.SoporteForm2.reset();
  }

  // Métodos de búsqueda y selección de clientes
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
    if (this.clienteSeleccionado?.servicios?.length) {
      this.servicioSeleccionado = this.clienteSeleccionado.servicios[0];
    }

    if (this.clienteSeleccionado) {
      this.busqueda = this.clienteSeleccionado.nombre_completo;
      this.busquedaCedula = this.clienteSeleccionado.cedula;
    } else {
      console.log('Cliente no encontrado');
    }
  }

  buscarClientePorCedula() {
    this.clienteSeleccionado =
      this.clientelista.find(
        (c) =>
          c.cedula.toLowerCase() === this.busquedaCedula.trim().toLowerCase()
      ) || null;
    if (this.clienteSeleccionado?.servicios?.length) {
      this.servicioSeleccionado = this.clienteSeleccionado.servicios[0];
    }

    if (this.clienteSeleccionado) {
      this.busqueda = this.clienteSeleccionado.nombre_completo;
      this.busquedaCedula = this.clienteSeleccionado.cedula;
    } else {
      console.log('Cliente no encontrado');
    }
  }

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
