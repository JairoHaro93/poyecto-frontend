import { Routes } from '@angular/router';
import { LoginComponent } from './pages/sistema/login/login.component';
import { HomeComponent } from './pages/sistema/home/home.component';
import { tokenGuard } from './guards/token.guard';
import { AdministradorComponent } from './pages/negocio/administrador/administrador.component';
import { UsuariosComponent } from './pages/negocio/administrador/usuarios/usuarios.component';
import { FormusuariosComponent } from './pages/negocio/administrador/formusuarios/formusuarios.component';
import { VistausuariosComponent } from './pages/negocio/administrador/vistausuarios/vistausuarios.component';
import { BodegaComponent } from './pages/negocio/bodega/bodega.component';
import { InventarioComponent } from './pages/negocio/bodega/inventario/inventario.component';
import { RecupcartComponent } from './pages/negocio/bodega/recupcart/recupcart.component';
import { NocComponent } from './pages/negocio/noc/noc.component';
import { InformediarioComponent } from './pages/negocio/noc/informediario/informediario.component';
import { DatosclientesComponent } from './pages/negocio/clientes/datosclientes/datosclientes.component';
import { AgendatecnicosComponent } from './pages/negocio/tecnico/agendatecnicos/agendatecnicos.component';
import { MorososComponent } from './pages/negocio/bodega/morosos/morosos.component';
import { usuariosGuard } from './guards/administrador/usuarios.guard';
import { inventarioGuard } from './guards/bodega/inventario.guard';
import { recupcartGuard } from './guards/Recuperacion/recupcart.guard';
import { ClientesComponent } from './pages/negocio/clientes/clientes.component';
import { DataclientesComponent } from './pages/negocio/administrador/dataclientes/dataclientes.component';
import { RegistrosoporteComponent } from './pages/negocio/tecnico/registrosoporte/registrosoporte.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [tokenGuard],
  },

  //ADMINISTRADOR
  {
    path: 'home/administrador',
    component: AdministradorComponent,

    children: [
      {
        path: 'usuarios',
        component: UsuariosComponent,
        canActivate: [usuariosGuard],
      },
      {
        path: 'clientes',
        component: DataclientesComponent,
      },
      {
        path: 'usuario/:id',
        component: VistausuariosComponent,
        canActivate: [usuariosGuard],
      },
      {
        path: 'crearusuario',
        component: FormusuariosComponent,
        canActivate: [usuariosGuard],
      },
      {
        path: 'actualizarusuario/:id',
        component: FormusuariosComponent,
        canActivate: [usuariosGuard],
      },
    ],
  },

  //BODEGA
  {
    path: 'home/bodega',
    component: BodegaComponent,
    children: [
      {
        path: 'inventario',
        component: InventarioComponent,
        canActivate: [inventarioGuard],
      },
      {
        path: 'recupcart',
        component: RecupcartComponent,
        canActivate: [recupcartGuard],
      },
      { path: 'morosos', component: MorososComponent },
    ],
  },

  //NOC
  {
    path: 'home/noc',
    component: NocComponent,
    children: [{ path: 'informediario', component: InformediarioComponent }],
  },

  //CLIENTES
  {
    path: 'home/clientes',
    component: NocComponent,
    children: [{ path: 'datos', component: DatosclientesComponent }],
  },

  //TECNICO
  {
    path: 'home/tecnico',
    component: NocComponent,
    children: [
      { path: 'agendatec', component: AgendatecnicosComponent },
      { path: 'registrosop', component: RegistrosoporteComponent },
    ],
  },

  { path: '**', redirectTo: 'home' }, //ruta 404
];
