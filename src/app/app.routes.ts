import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { tokenGuard } from './guards/token.guard';

import { AdministradorComponent } from './pages/administrador/administrador.component';
import { UsuariosComponent } from './pages/administrador/usuarios/usuarios.component';
import { FormusuariosComponent } from './pages/administrador/formusuarios/formusuarios.component';
import { VistausuariosComponent } from './pages/administrador/vistausuarios/vistausuarios.component';
import { BodegaComponent } from './pages/bodega/bodega.component';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [tokenGuard, roleGuard],
  },

  //administrador
  {
    path: 'home/administrador',
    component: AdministradorComponent,
    children: [
      {
        path: 'usuarios',
        component: UsuariosComponent,
        canActivate: [roleGuard],
      },
      { path: 'usuario/:id', component: VistausuariosComponent },
      { path: 'crearusuario', component: FormusuariosComponent },
      { path: 'actualizarusuario/:id', component: FormusuariosComponent },
    ],
  },

  //bodega
  { path: 'home/bodega', component: BodegaComponent, canActivate: [roleGuard] },

  { path: '**', redirectTo: 'home' }, //ruta 404
];
