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
import { InventarioComponent } from './pages/bodega/inventario/inventario.component';
import { RecupcartComponent } from './pages/bodega/recupcart/recupcart.component';
import { NocComponent } from './pages/noc/noc.component';
import { InformediarioComponent } from './pages/noc/informediario/informediario.component';
import { DatosclientesComponent } from './pages/clientes/datosclientes/datosclientes.component';
import { AgendatecnicosComponent } from './pages/tecnico/agendatecnicos/agendatecnicos.component';
import { MorososComponent } from './pages/bodega/morosos/morosos.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [tokenGuard],
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
      {
        path: 'usuario/:id',
        component: VistausuariosComponent,
        canActivate: [roleGuard],
      },
      {
        path: 'crearusuario',
        component: FormusuariosComponent,
        canActivate: [roleGuard],
      },
      {
        path: 'actualizarusuario/:id',
        component: FormusuariosComponent,
        canActivate: [roleGuard],
      },
    ],
  },

  //bodega
  {
    path: 'home/bodega',
    component: BodegaComponent,
    children: [
      { path: 'inventario', component: InventarioComponent },
      { path: 'recupcart', component: RecupcartComponent },
      { path: 'morosos', component: MorososComponent },
    ],
  },

  //NOC
  {
    path: 'home/noc',
    component: NocComponent,
    children: [{ path: 'informediario', component: InformediarioComponent }],
  },

  //NOC
  {
    path: 'home/clientes',
    component: NocComponent,
    children: [{ path: 'datos', component: DatosclientesComponent }],
  },

  //TECNICO
  {
    path: 'home/tecnico',
    component: NocComponent,
    children: [{ path: 'agendatec', component: AgendatecnicosComponent }],
  },

  { path: '**', redirectTo: 'home' }, //ruta 404
];
