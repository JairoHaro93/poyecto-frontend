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
import { UsuariosService } from '../../../services/usuarios.service';
import { Iusuarios } from '../../../interfaces/iusuarios.interface';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import { FuncionesService } from '../../../services/funciones.service';

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
  errorForm: any[] = [];
  arrfunciones: any[] = [];
  selectedIds: number[] = [];

  // Injectables
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private usuarioServices = inject(UsuariosService);
  private funcionesServices = inject(FuncionesService);

  constructor(private fb: FormBuilder) {
    this.initializeForms();
  }

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
        Validators.required,
        Validators.minLength(6),
      ]),
      fecha_nac: new FormControl(null, [Validators.required]),
      fecha_cont: new FormControl(null, [Validators.required]),
      genero: new FormControl('M', [Validators.required]),
      rol: [null],
    });

    this.funcionesForm = this.fb.group({
      rol: [null],
      funcion: [null],
    });
  }

  ciValidator(controlName: AbstractControl): any {
    let cedula = controlName.value;
    const exp = /^\d{10}/;

    if (exp.test(cedula)) {
      var digito_region = parseInt(cedula.substring(0, 2));
      //Pregunto si la region existe ecuador se divide en 24 regiones
      if (digito_region >= 1 && digito_region <= 24) {
        // Extraigo el ultimo digito
        var ultimo_digito = parseInt(cedula.substring(9, 10));
        //Agrupo todos los pares y los sumo
        var pares =
          parseInt(cedula.substring(1, 2)) +
          parseInt(cedula.substring(3, 4)) +
          parseInt(cedula.substring(5, 6)) +
          parseInt(cedula.substring(7, 8));

        //Agrupo los impares, los multiplico por un factor de 2, si la resultante es > que 9 le restamos el 9 a la resultante
        var numero1 = parseInt(cedula.substring(0, 1));
        var numero1 = numero1 * 2;
        if (numero1 > 9) {
          var numero1 = numero1 - 9;
        }
        var numero3 = parseInt(cedula.substring(2, 3));
        var numero3 = numero3 * 2;
        if (numero3 > 9) {
          var numero3 = numero3 - 9;
        }
        var numero5 = parseInt(cedula.substring(4, 5));
        var numero5 = numero5 * 2;
        if (numero5 > 9) {
          var numero5 = numero5 - 9;
        }
        var numero7 = parseInt(cedula.substring(6, 7));
        var numero7 = numero7 * 2;
        if (numero7 > 9) {
          var numero7 = numero7 - 9;
        }
        var numero9 = parseInt(cedula.substring(8, 9));
        var numero9 = numero9 * 2;
        if (numero9 > 9) {
          var numero9 = numero9 - 9;
        }
        var impares = numero1 + numero3 + numero5 + numero7 + numero9;

        //Suma total
        var suma_total = pares + impares;

        //extraemos el primero digito
        var primer_digito_suma = String(suma_total).substring(0, 1);

        //Obtenemos la decena inmediata
        var decena = (parseInt(primer_digito_suma) + 1) * 10;

        //Obtenemos la resta de la decena inmediata - la suma_total esto nos da el digito validador
        var digito_validador = decena - suma_total;

        //Si el digito validador es = a 10 toma el valor de 0
        if (digito_validador == 10) var digito_validador = 0;

        //Validamos que el digito validador sea igual al de la cedula
        if (digito_validador == ultimo_digito) {
          console.log('la cedula:' + cedula + ' es correcta');
          // devuelve el validador cuando ha validado la condicion
          return null;
        } else {
          console.log('la cedula:' + cedula + ' es incorrecta');
          return { civalidator: 'Cedula Incorrecta' };
        }
      } else {
        // imprimimos en consola si la region no pertenece
        console.log('Esta cedula no pertenece a ninguna region');
        return { civalidator: 'Cedula Incorrecta' };
      }
    } else {
      return { civalidator: 'Digite 10 Dígitos' };
    }
  }

  checkControl(formControlName: string, validador: string) {
    return (
      this.usuarioForm.get(formControlName)?.hasError(validador) &&
      this.usuarioForm.get(formControlName)?.touched
    );
  }

  async ngOnInit() {
    this.loadFunciones();

    this.activatedRoute.params.subscribe(async (params: any) => {
      if (params.id) {
        this.tipo = 'Actualizar';
        await this.loadUsuario(params.id);
        this.syncFuncionesWithRoles();
      }
    });
  }
  private syncFuncionesWithRoles() {
    this.selectedIds.forEach((id) => {
      const funcion = this.arrfunciones.find((f) => f.id === id);
      if (funcion) {
        funcion.selected = true; // Si tienes una propiedad para el estado seleccionado
      }
    });
  }
  private async loadFunciones() {
    try {
      this.arrfunciones = await this.funcionesServices.getAll();
    } catch (error) {
      console.error('Error loading funciones:', error);
    }
  }

  private async loadUsuario(id: string) {
    try {
      const usuario: Iusuarios = await this.usuarioServices.getbyId(id);
      this.usuarioForm.patchValue({
        ...usuario,
        fecha_nac: usuario.fecha_nac
          ? format(new Date(usuario.fecha_nac), 'yyyy-MM-dd')
          : null,
        fecha_cont: usuario.fecha_cont
          ? format(new Date(usuario.fecha_cont), 'yyyy-MM-dd')
          : null,
      });
      this.selectedIds = usuario.rol || [];
      //console.log(usuario);
    } catch (error) {
      console.error('Error loading usuario:', error);
    }
  }

  addStatus(item: { funcion: number }, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      if (!this.selectedIds.includes(item.funcion)) {
        this.selectedIds.push(item.funcion);
      }
    } else {
      this.selectedIds = this.selectedIds.filter((id) => id !== item.funcion);
    }
    this.usuarioForm.value.rol = this.selectedIds;

    //this.usuarioForm.patchValue({ rol: this.selectedIds });
    // console.log(this.usuarioForm.value.rol);
  }

  async getDataForm() {
    try {
      const usuarioData = this.usuarioForm.value;

      if (usuarioData.id) {
        // console.log(usuarioData);
        // Actualizar
        const response = await this.usuarioServices.update(usuarioData);
        Swal.fire('Realizado', 'Usuario Actualizado', 'success');
      } else {
        // Insertar
        const response = await this.usuarioServices.insert(usuarioData);
        Swal.fire('Realizado', 'Usuario Creado', 'success');
      }

      this.router.navigate(['/home', 'administrador', 'usuarios']);
    } catch ({ error }: any) {
      this.errorForm = error || [];
      console.error('Error guardando usuario:', this.errorForm);
    }
  }
}
