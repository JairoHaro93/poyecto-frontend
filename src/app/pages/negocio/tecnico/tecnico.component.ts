import { Component } from '@angular/core';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-tecnico',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './tecnico.component.html',
  styleUrl: './tecnico.component.css',
})
export class TecnicoComponent {}
