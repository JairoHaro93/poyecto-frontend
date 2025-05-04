import { Component, inject } from '@angular/core';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';
import { SoketService } from '../../../services/socket_io/soket.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [SidebarComponent, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  private soketService = inject(SoketService);

  ngOnInit(): void {
    // this.soketService.connectSocket();
  }
}
