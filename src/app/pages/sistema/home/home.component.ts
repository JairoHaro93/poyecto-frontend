import { Component, inject, OnInit } from '@angular/core';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { SoketService } from '../../../services/socket_io/soket.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private soketService = inject(SoketService);

  ngOnInit(): void {
    // this.soketService.connectSocket();
  }
}
