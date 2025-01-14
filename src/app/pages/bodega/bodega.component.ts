import { Component } from '@angular/core';

import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-bodega',
  standalone: true,
  imports: [],
  templateUrl: './bodega.component.html',
  styleUrl: './bodega.component.css',
})
export class BodegaComponent {
  arrfunciones: any[] = [];

  addStatus(item: { funcion: number }, event: Event): void {}
}
