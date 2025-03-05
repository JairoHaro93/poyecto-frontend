import { Component, EventEmitter, inject, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientesService } from '../../../../services/negocio_atuntaqui/clientes.service';
import { Iclientes } from '../../../../interfaces/negocio/clientes/iclientes.interface';
import { Isoportes } from '../../../../interfaces/negocio/soportes/isoportes.interface';
import { JwtPayload } from 'jwt-decode';
import { AutenticacionService } from '../../../../services/sistema/autenticacion.service';
import { SoportesService } from '../../../../services/negocio_latacunga/soportes.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

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

  clientelista: Iclientes[] = [];
  soportesPendientes: Isoportes[] = [];

  SoporteForm2: FormGroup;

  private router = inject(Router);

  datosUsuario: any;

  // Búsqueda por nombre
  busqueda: string = '';
  nombresFiltrados: string[] = [];

  // Búsqueda por cédula
  busquedaCedula: string = '';

  // Cliente seleccionado (se utiliza para actualizar ambos campos y obtener servicios)
  clienteSeleccionado: Iclientes | null = null;

  // Servicio seleccionado a través del radio button
  servicioSeleccionado: any = null;

  @Output() nuevoSoporte: EventEmitter<Isoportes> = new EventEmitter();

  constructor() {
    this.SoporteForm2 = new FormGroup({
      ord_ins: new FormControl(null, []),
      reg_sop_observaciones: new FormControl('', []),
      cli_tel: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]{10,}$'), // Solo números, mínimo 7 dígitos
      ]),
      reg_sop_opc: new FormControl(null, [Validators.required]), // Valor por defecto
      reg_sop_registrado_por_id: new FormControl('', []),
      reg_sop_nombre: new FormControl('', []),
    });
  }

  async ngOnInit() {
    this.clientelista = await this.clienteService.getInfoClientes();
    this.datosUsuario = this.authService.datosLogged();
    await this.cargarSoportesPendientes();
  }

  async cargarSoportesPendientes() {
    this.soportesPendientes = await this.soporteService.getAllPendientes();
  }

  resetDatosGenerales() {
    this.busqueda = '';
    this.busquedaCedula = '';
    this.nombresFiltrados = [];
    this.clienteSeleccionado = null;
    this.servicioSeleccionado = null;
    this.SoporteForm2.reset();
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

  async getDataForm2() {
    if (this.SoporteForm2.valid) {
      this.SoporteForm2.patchValue({
        reg_sop_nombre: this.clienteSeleccionado?.nombre_completo,
        ord_ins: this.servicioSeleccionado.orden_instalacion,
        reg_sop_registrado_por_id: this.datosUsuario.usuario_id,
      });

      console.log('Formulario válido:', this.SoporteForm2.value);

      const SoporteData = this.SoporteForm2.value;
      try {
        const response = await this.soporteService.insert(SoporteData);
        Swal.fire('Realizado', 'Orden de Soporte Creado', 'success');
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
}
