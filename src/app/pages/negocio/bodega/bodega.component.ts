import { Component } from '@angular/core';

import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-bodega',
  standalone: true,
  imports: [SidebarComponent, RouterOutlet],
  templateUrl: './bodega.component.html',
  styleUrl: './bodega.component.css',
})
export class BodegaComponent {}
