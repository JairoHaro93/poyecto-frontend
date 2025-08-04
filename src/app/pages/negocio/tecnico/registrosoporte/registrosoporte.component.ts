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
import { Iusuarios } from '../../../../interfaces/sistema/iusuarios.interface';
import { SoketService } from '../../../../services/socket_io/soket.service';

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
  datosUsuario!: Iusuarios;

  // Conexión con Socket.IO

  private socketService = inject(SoketService);

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
      reg_sop_coment_cliente: new FormControl(null, []),
      reg_sop_tel: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]{10,}$'),
      ]),
      reg_sop_opc: new FormControl(null, [Validators.required]),
      reg_sop_registrado_por_id: new FormControl('', []),
      // reg_sop_nombre: new FormControl('', []),
    });
  }

  async ngOnInit() {
    try {
      this.clientelista = await this.clienteService.getInfoClientesActivos();
      this.datosUsuario = await this.authService.getUsuarioAutenticado();
      await this.cargarSoportesPendientes();

      // 🔗 Ya no se crea un socket aquí, solo usamos el existente
      this.socketService.on('actualizarSoportes', async () => {
        console.log(
          '🔄 Recibiendo actualización de soportes en RegistrosoporteComponent'
        );
        await this.cargarSoportesPendientes();
      });
    } catch (error) {
      console.error('❌ Error al iniciar RegistroSoporteComponent:', error);
      this.router.navigateByUrl('/login');
    }
  }

  async cargarSoportesPendientes() {
    this.soportesPendientes = await this.soporteService.getAllPendientes();
  }

  async getDataForm2() {
    if (this.SoporteForm2.valid) {
      this.SoporteForm2.patchValue({
        //reg_sop_nombre: this.clienteSeleccionado?.nombre_completo,
        ord_ins: this.servicioSeleccionado?.orden_instalacion || null,

        reg_sop_registrado_por_id: this.datosUsuario.id,
      });

      console.log('Formulario válido:', this.SoporteForm2.value);

      const SoporteData = this.SoporteForm2.value;
      try {
        const response = await this.soporteService.createSop(SoporteData);
        Swal.fire('Realizado', 'Orden de Soporte Creado', 'success');

        // ✅ Emitir evento de soporte creado a través del SoketService
        this.socketService.emit('soporteCreado');

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
      const detalle = await this.clienteService.getInfoClientesArrayActivos(
        cedula
      );
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
