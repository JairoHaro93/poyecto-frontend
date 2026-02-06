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
import { Iusuarios } from '../../../../interfaces/sistema/iusuarios.interface';
import { SoketService } from '../../../../services/socket_io/soket.service';

// RxJS para búsqueda con debounce y server-side
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  catchError,
} from 'rxjs/operators';
import { of, from, firstValueFrom } from 'rxjs';

// Sugerencia: estructura mínima que devuelve /clientes/buscar
interface ClienteSugerencia {
  cedula: string;
  nombre_completo: string;
}

@Component({
  selector: 'app-registrosoporte',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './registrosoporte.component.html',
  styleUrls: ['./registrosoporte.component.css'],
})
export class RegistrosoporteComponent {
  // Servicios inyectados
  private readonly clienteService = inject(ClientesService);
  private readonly authService = inject(AutenticacionService);
  private readonly soporteService = inject(SoportesService);
  private readonly router = inject(Router);
  private readonly socketService = inject(SoketService);

  // Estado
  soportesPendientes: Isoportes[] = [];
  SoporteForm2: FormGroup;
  datosUsuario!: Iusuarios;

  // Búsquedas (server-side)
  busquedaCtrl = new FormControl<string>('', { nonNullable: true });
  nombresFiltrados: ClienteSugerencia[] = [];
  busquedaCedula: string = '';
  showSugerencias = false;
  highlightedIndex = -1;

  // Selección actual
  clienteSeleccionado: Iclientes | null = null;
  servicioSeleccionado: any = null; // TODO: tipar según interfaz de servicio

  @Output() nuevoSoporte: EventEmitter<Isoportes> = new EventEmitter();

  // ✅ Suavizado de render (NUEVO)
  isReady = false;

  constructor() {
    this.SoporteForm2 = new FormGroup({
      reg_sop_coordenadas: new FormControl<string | null>(null),
      ord_ins: new FormControl<number | null>(null),
      reg_sop_coment_cliente: new FormControl<string | null>(null),
      reg_sop_tel: new FormControl<string>('', [
        Validators.required,
        Validators.pattern(
          /^\s*\+?\s*(?:\d\s*){10,}(?:\s*(?:[;,\/]|\s{2,})\s*\+?\s*(?:\d\s*){10,})*\s*$/,
        ),
      ]),
      reg_sop_opc: new FormControl<string | null>(null, [Validators.required]),
      reg_sop_registrado_por_id: new FormControl<number | string>(''),
    });
  }

  async ngOnInit() {
    try {
      this.datosUsuario = await this.authService.getUsuarioAutenticado();
      await this.cargarSoportesPendientes();

      this.busquedaCtrl.valueChanges
        .pipe(
          map((v) => (v ?? '').trim()),
          debounceTime(250),
          distinctUntilChanged(),
          switchMap((v) => {
            if (v.length < 2) {
              // limpiar todo lo relacionado al cliente cuando se borra
              this.clearClienteRelacionado();
              this.nombresFiltrados = [];
              this.showSugerencias = false;
              this.highlightedIndex = -1;
              return of([] as ClienteSugerencia[]);
            }
            return from(this.clienteService.buscarClientesActivos(v, 10)).pipe(
              catchError(() => of([] as ClienteSugerencia[])),
            );
          }),
        )
        .subscribe((list) => {
          this.nombresFiltrados = list;
          this.showSugerencias = list.length > 0;
          this.highlightedIndex = list.length ? 0 : -1;
        });

      // Escucha de actualizaciones por Socket.IO (usando servicio compartido)
      this.socketService.on('actualizarSoportes', async () => {
        await this.cargarSoportesPendientes();
      });
    } catch (error) {
      console.error('❌ Error al iniciar RegistrosoporteComponent:', error);
      //this.router.navigateByUrl('/login');
    } finally {
      this.isReady = true; // ⬅️ muestra el contenido
    }
  }

  private clearClienteRelacionado() {
    this.busquedaCedula = '';
    this.clienteSeleccionado = null;
    this.servicioSeleccionado = null;
    // limpiar campos derivados de la selección
    this.SoporteForm2.patchValue({ ord_ins: null });
    // Si quieres, también limpia observaciones/teléfono:
    this.SoporteForm2.patchValue({
      reg_sop_coment_cliente: null,
      reg_sop_tel: '',
    });
  }

  async cargarSoportesPendientes() {
    this.soportesPendientes = await this.soporteService.getAllPendientes();

    // 2) extrae ord_ins únicos (asegura número si tu batch usa ord_ins numérico)
    const ords = Array.from(
      new Set(
        this.soportesPendientes
          .map((s) => (s?.ord_ins ?? '').toString().trim())
          .filter((v) => v !== ''),
      ),
    );

    if (ords.length === 0) return;

    // 3) llama batch
    let batch;
    try {
      batch = await firstValueFrom(
        this.clienteService.getClientesByOrdInsBatch(ords),
      );
    } catch (e) {
      console.error('❌ Error batch clientes:', e);
      return;
    }

    // 4) indexa por orden_instalacion
    const byOrd = new Map<string, any>();
    (batch ?? []).forEach((row) => {
      // normaliza a string para comparar con s.ord_ins
      byOrd.set(String(row.orden_instalacion), row);
    });

    // 5) enriquece
    this.soportesPendientes = this.soportesPendientes.map((s) => {
      const info = byOrd.get(String(s.ord_ins));
      return {
        ...s,
        clienteNombre: info?.nombre_completo ?? s.reg_sop_nombre ?? '',
        clienteCedula: info?.cedula ?? '',
        clienteDireccion: info?.direccion ?? '',
        clienteTelefonos: info?.telefonos ?? '',
        clientePlan: info?.plan_nombre ?? '',
        clienteIP: info?.ip ?? '',
      };
    });
  }

  async getDataForm2() {
    if (this.SoporteForm2.valid) {
      this.SoporteForm2.patchValue({
        ord_ins: this.servicioSeleccionado?.orden_instalacion || null,
        reg_sop_registrado_por_id: this.datosUsuario.id,
      });

      const SoporteData = this.SoporteForm2.value;
      try {
        await this.soporteService.createSop(SoporteData);
        Swal.fire('Realizado', 'Orden de Soporte Creado', 'success');

        // Emitir evento de soporte creado
        this.socketService.emit('soporteCreado');

        await this.cargarSoportesPendientes();
        this.resetDatosGenerales();
      } catch ({ error }: any) {
        Swal.fire(
          'Error guardando soporte',
          error?.message || 'Error',
          'error',
        );
      }
    } else {
      this.SoporteForm2.markAllAsTouched();
    }
  }

  resetDatosGenerales() {
    this.busquedaCtrl.setValue('');
    this.nombresFiltrados = [];
    this.showSugerencias = false;
    this.highlightedIndex = -1;
    this.clearClienteRelacionado();
    this.SoporteForm2.reset();
  }

  // Selección desde sugerencias {cedula, nombre_completo}
  async seleccionarNombre(c: ClienteSugerencia) {
    this.busquedaCtrl.setValue(c.nombre_completo, { emitEvent: false });
    this.busquedaCedula = c.cedula;
    this.nombresFiltrados = [];
    this.showSugerencias = false;
    this.highlightedIndex = -1;
    await this.cargarDetalleClientePorCedula();
  }

  onNombreKeydown(event: KeyboardEvent) {
    if (!this.showSugerencias || this.nombresFiltrados.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        this.highlightedIndex =
          (this.highlightedIndex + 1) % this.nombresFiltrados.length;
        event.preventDefault();
        break;
      case 'ArrowUp':
        this.highlightedIndex =
          (this.highlightedIndex + this.nombresFiltrados.length - 1) %
          this.nombresFiltrados.length;
        event.preventDefault();
        break;
      case 'Enter':
        if (this.highlightedIndex >= 0) {
          this.seleccionarNombre(this.nombresFiltrados[this.highlightedIndex]);
          event.preventDefault();
        }
        break;
      case 'Escape':
        this.showSugerencias = false;
        this.highlightedIndex = -1;
        event.preventDefault();
        break;
    }
  }

  onInputBlur() {
    // Da tiempo a que haga click en una sugerencia antes de ocultar
    setTimeout(() => (this.showSugerencias = false), 150);
  }

  onInputFocus() {
    const v = (this.busquedaCtrl.value ?? '').trim();
    if (v.length >= 2 && this.nombresFiltrados.length > 0) {
      this.showSugerencias = true;
    }
  }

  // Búsqueda directa por cédula
  async buscarClientePorCedula() {
    const cedulaBuscada = this.busquedaCedula.trim();
    if (!cedulaBuscada) return;
    await this.cargarDetalleClientePorCedula();
  }

  // Carga el detalle completo del cliente por su cédula
  async cargarDetalleClientePorCedula() {
    const cedula = this.busquedaCedula.trim();
    if (!cedula) return;

    try {
      const detalle =
        await this.clienteService.getInfoClientesArrayActivos(cedula);
      if (detalle?.servicios?.length > 0) {
        this.clienteSeleccionado = detalle;
        this.servicioSeleccionado = detalle.servicios[0];

        // ⬇️ Autollenar nombre y cerrar sugerencias
        this.busquedaCtrl.setValue(detalle.nombre_completo, {
          emitEvent: false,
        });
        this.nombresFiltrados = [];
        this.showSugerencias = false;
        this.highlightedIndex = -1;
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
      .catch((err) => console.error('Error al copiar IP: ', err));
  }

  convertToUppercase(field: string): void {
    const control = this.SoporteForm2.get(field);
    if (control) {
      control.setValue(control.value.toUpperCase(), { emitEvent: false });
    }
  }
}
