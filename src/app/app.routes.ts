import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { tokenGuard } from './guards/token.guard';
import { CrearusuarioComponent } from './pages/administrador/crearusuario/crearusuario.component';
import { AdministradorComponent } from './pages/administrador/administrador.component';
import { UsuariosComponent } from './pages/administrador/usuarios/usuarios.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [tokenGuard] },

  //administrador
  {
    path: 'home/administrador',
    component: AdministradorComponent,
    children: [
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'crearusuario', component: CrearusuarioComponent },
    ],
  },

  { path: '**', redirectTo: 'home' }, //ruta 404
];
