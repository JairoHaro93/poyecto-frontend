import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  
  router= inject(Router)
  
  onClickLogout(){
    localStorage.removeItem('token_proyecto')
    this.router.navigateByUrl('/login')
  }
}
