import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { format } from 'date-fns';
import Swal from 'sweetalert2';

import { UsuariosService } from '../../../../services/sistema/usuarios.service';
import { FuncionesService } from '../../../../services/sistema/funciones.service';
import { AutenticacionService } from '../../../../services/sistema/autenticacion.service';

import { Iusuarios } from '../../../../interfaces/sistema/iusuarios.interface';
import { SucursalesService } from '../../../../services/sistema/sucursales.service';
import { DepartamentosService } from '../../../../services/sistema/departamentos.service';
import { ISucursal } from '../../../../interfaces/sistema/isucursal.interface';
import { IDepartamento } from '../../../../interfaces/sistema/idepartamento.interface';

@Component({
  selector: 'app-formusuarios',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './formusuarios.component.html',
  styleUrl: './formusuarios.component.css',
})
export class FormusuariosComponent {
  tipo: string = 'Crear';
  usuarioForm!: FormGroup;
  funcionesForm!: FormGroup;

  arrfunciones: any[] = [];
  selectedIds: number[] = [];

  sucursales: ISucursal[] = [];
  departamentos: IDepartamento[] = [];

  authService = inject(AutenticacionService);

  // Injectables
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private usuarioServices = inject(UsuariosService);
  private funcionesServices = inject(FuncionesService);
  private sucursalesService = inject(SucursalesService);
  private departamentosService = inject(DepartamentosService);

  constructor(private fb: FormBuilder) {
    this.initializeForms();
  }

  /* ==========================
      INICIALIZACIÓN FORM
  ========================== */

  private initializeForms(): void {
    this.usuarioForm = this.fb.group({
      id: [null],
      nombre: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
      ]),
      apellido: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
      ]),
      usuario: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
      ]),
      ci: new FormControl(null, [Validators.required, this.ciValidator]),
      password: new FormControl(null, [
        // en Crear será required, en Actualizar se ajusta en ngOnInit
        Validators.minLength(6),
      ]),
      fecha_nac: new FormControl(null, [Validators.required]),
      fecha_cont: new FormControl(null, [Validators.required]),
      genero: new FormControl('M', [Validators.required]),

      // NUEVO: sucursal y departamento
      sucursal_id: new FormControl<number | null>(null, [Validators.required]),
      departamento_id: new FormControl<number | null>(null, [
        Validators.required,
      ]),

      // IDs de funciones seleccionadas
      rol: this.fb.control<number[]>([]),
    });

    this.funcionesForm = this.fb.group({
      rol: [null],
      funcion: [null],
    });
  }

  /* ==========================
      HELPERS
  ========================== */

  convertToUppercase(controlName: string): void {
    const control = this.usuarioForm.get(controlName);
    if (control && control.value) {
      control.setValue(String(control.value).toUpperCase(), {
        emitEvent: false,
      });
    }
  }

  ciValidator(controlName: AbstractControl): any {
    let cedula = controlName.value;
    const exp = /^\d{10}/;

    if (exp.test(cedula)) {
      var digito_region = parseInt(cedula.substring(0, 2));
      if (digito_region >= 1 && digito_region <= 24) {
        var ultimo_digito = parseInt(cedula.substring(9, 10));

        var pares =
          parseInt(cedula.substring(1, 2)) +
          parseInt(cedula.substring(3, 4)) +
          parseInt(cedula.substring(5, 6)) +
          parseInt(cedula.substring(7, 8));

        var numero1 = parseInt(cedula.substring(0, 1));
        numero1 = numero1 * 2;
        if (numero1 > 9) {
          numero1 = numero1 - 9;
        }
        var numero3 = parseInt(cedula.substring(2, 3));
        numero3 = numero3 * 2;
        if (numero3 > 9) {
          numero3 = numero3 - 9;
        }
        var numero5 = parseInt(cedula.substring(4, 5));
        numero5 = numero5 * 2;
        if (numero5 > 9) {
          numero5 = numero5 - 9;
        }
        var numero7 = parseInt(cedula.substring(6, 7));
        numero7 = numero7 * 2;
        if (numero7 > 9) {
          numero7 = numero7 - 9;
        }
        var numero9 = parseInt(cedula.substring(8, 9));
        numero9 = numero9 * 2;
        if (numero9 > 9) {
          numero9 = numero9 - 9;
        }
        var impares = numero1 + numero3 + numero5 + numero7 + numero9;
        var suma_total = pares + impares;
        var primer_digito_suma = String(suma_total).substring(0, 1);
        var decena = (parseInt(primer_digito_suma) + 1) * 10;
        var digito_validador = decena - suma_total;
        if (digito_validador == 10) digito_validador = 0;
        if (digito_validador == ultimo_digito) {
          return null;
        } else {
          return { civalidator: 'Cédula incorrecta' };
        }
      } else {
        return { civalidator: 'Cédula incorrecta' };
      }
    } else {
      return { civalidator: 'Digite 10 dígitos' };
    }
  }

  checkControl(formControlName: string, validador: string) {
    return (
      this.usuarioForm.get(formControlName)?.hasError(validador) &&
      this.usuarioForm.get(formControlName)?.touched
    );
  }

  /* ==========================
      CARGA INICIAL
  ========================== */

  isReady = false;

  async ngOnInit() {
    // Cargar catálogos en paralelo
    await Promise.all([
      this.loadFunciones(),
      this.loadSucursales(),
      this.loadDepartamentos(),
    ]);

    const id = this.activatedRoute.snapshot.paramMap.get('id');

    if (id) {
      this.tipo = 'Actualizar';
      await this.loadUsuario(id);

      // En actualización: password opcional
      const passCtrl = this.usuarioForm.get('password');
      passCtrl?.clearValidators();
      passCtrl?.setValidators([Validators.minLength(6)]);
      passCtrl?.updateValueAndValidity({ emitEvent: false });
    } else {
      this.tipo = 'Crear';
      const passCtrl = this.usuarioForm.get('password');
      passCtrl?.setValidators([Validators.required, Validators.minLength(6)]);
      passCtrl?.updateValueAndValidity({ emitEvent: false });
    }

    this.isReady = true;
  }

  private async loadFunciones() {
    try {
      this.arrfunciones = await this.funcionesServices.getAll();
    } catch (error) {
      console.error('Error loading funciones:', error);
    }
  }

  private async loadSucursales() {
    try {
      this.sucursales = await this.sucursalesService.getAll();
    } catch (error) {
      console.error('Error cargando sucursales:', error);
      this.sucursales = [];
    }
  }

  private async loadDepartamentos() {
    try {
      this.departamentos = await this.departamentosService.getAll();
    } catch (error) {
      console.error('Error cargando departamentos:', error);
      this.departamentos = [];
    }
  }

  /* ==========================
      CARGA DE USUARIO (EDITAR)
  ========================== */

  private async loadUsuario(id: string) {
    try {
      const usuario: Iusuarios = await this.usuarioServices.getbyId(id);
      //
      //    console.log('[FORMUSUARIOS] usuario recibido:', usuario);
      //   console.log('[FORMUSUARIOS] roles desde backend:', usuario.rol);
      //   console.log('[FORMUSUARIOS] arrfunciones:', this.arrfunciones);

      this.usuarioForm.patchValue({
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        usuario: usuario.usuario,
        ci: usuario.ci,
        fecha_nac: usuario.fecha_nac
          ? format(new Date(usuario.fecha_nac), 'yyyy-MM-dd')
          : null,
        fecha_cont: usuario.fecha_cont
          ? format(new Date(usuario.fecha_cont), 'yyyy-MM-dd')
          : null,
        genero: usuario.genero,
        sucursal_id: usuario.sucursal_id ?? null,
        departamento_id: usuario.departamento_id ?? null,
        password: null,
      });

      // ---- ROLES → IDs de funciones ----
      const nombresRol: string[] = Array.isArray(usuario.rol)
        ? usuario.rol.map((r: any) => String(r))
        : [];

      this.selectedIds = this.arrfunciones
        .filter((f: any) => nombresRol.includes(f.nombre))
        .map((f: any) => Number(f.id));

      this.usuarioForm.get('rol')!.setValue([...this.selectedIds]);

      //   console.log('[FORMUSUARIOS] selectedIds calculados:', this.selectedIds);
    } catch (error) {
      console.error('Error loading usuario:', error);
    }
  }

  /* ==========================
      CHECKBOX DE FUNCIONES
  ========================== */

  onToggleRol(funcionId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const id = Number(funcionId);

    if (checked) {
      if (!this.selectedIds.includes(id)) this.selectedIds.push(id);
    } else {
      this.selectedIds = this.selectedIds.filter((x) => x !== id);
    }
    this.usuarioForm.get('rol')!.setValue([...this.selectedIds]);
    this.usuarioForm.get('rol')!.markAsDirty();
  }

  /* ==========================
      GUARDAR
  ========================== */

  async getDataForm() {
    try {
      const formValue = this.usuarioForm.value;

      const payload = {
        ...formValue,
        rol: (formValue.rol || []).map((x: any) => Number(x)),
      };

      if (payload.id) {
        await this.usuarioServices.update(payload);
        Swal.fire('Realizado', 'Usuario actualizado', 'success');
      } else {
        await this.usuarioServices.insert(payload);
        Swal.fire('Realizado', 'Usuario creado', 'success');
      }

      this.router.navigate(['/home', 'administrador', 'usuarios']);
    } catch ({ error }: any) {
      Swal.fire('Error guardando usuario', error?.message || 'Error', 'error');
    }
  }
}
