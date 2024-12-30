import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ContenidoComponent } from '../../components/contenido/contenido.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, ContenidoComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
