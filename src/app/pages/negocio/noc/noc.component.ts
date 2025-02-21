import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-noc',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './noc.component.html',
  styleUrl: './noc.component.css',
})
export class NocComponent {}
