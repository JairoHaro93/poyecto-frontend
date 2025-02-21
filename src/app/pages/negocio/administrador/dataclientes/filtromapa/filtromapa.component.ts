import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientesService } from '../../../../../services/negocio_atuntaqui/clientes.service';

@Component({
  selector: 'app-filtromapa',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './filtromapa.component.html',
  styleUrl: './filtromapa.component.css',
})
export class FiltromapaComponent {
  //injectables
  clienteService = inject(ClientesService);

  //variables
  clientelista: any[] = [];

  @Output() filtro_emitido: EventEmitter<any> = new EventEmitter();

  async ngOnInit() {
    //  this.clientelista = await this.clienteService.getAll();
  }

  selectFilter(filterFormValue: any) {
    let materiaNombre = filterFormValue.materiaNombre;
    let valmin = filterFormValue.valmin;
    let valmax = filterFormValue.valmax;
    let puntuacion = filterFormValue.puntuacion;
    let criterio = filterFormValue.criterio;
    let experiencia = filterFormValue.experiencia;
    if (valmin === null) valmin = '';
    if (valmax === null) valmax = '';

    this.filtro_emitido.emit([
      materiaNombre,
      valmin,
      valmax,
      puntuacion,
      criterio,
      experiencia,
    ]);
  }
}
