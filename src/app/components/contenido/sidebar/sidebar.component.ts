import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  router = inject(Router);

  onClickLogout() {
    localStorage.removeItem('token_proyecto');
    this.router.navigateByUrl('/login');
  }
}
