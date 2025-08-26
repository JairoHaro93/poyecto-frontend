import { Component } from '@angular/core';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-recuperacion',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './recuperacion.component.html',
  styleUrl: './recuperacion.component.css',
})
export class RecuperacionComponent {}
