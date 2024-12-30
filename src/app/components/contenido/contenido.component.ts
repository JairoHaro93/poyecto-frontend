import { Component } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-contenido',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './contenido.component.html',
  styleUrl: './contenido.component.css',
})
export class ContenidoComponent {}
