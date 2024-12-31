import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  //variables
  isMenu = false;

  //injetcables
  router = inject(Router);

  onClickLogout() {
    localStorage.removeItem('token_proyecto');
    this.router.navigateByUrl('/login');
  }

  onClickMenu() {
    this.isMenu = !this.isMenu;
  }
}
