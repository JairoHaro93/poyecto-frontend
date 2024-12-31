import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { tokenGuard } from './guards/token.guard';
import { CrearusuarioComponent } from './pages/crearusuario/crearusuario.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [tokenGuard] },

  //sistema
  { path: 'home/sistema/crearusuario', component: CrearusuarioComponent },
];
