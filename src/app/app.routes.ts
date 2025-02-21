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

import { NocComponent } from './pages/negocio/noc/noc.component';
import { InformediarioComponent } from './pages/negocio/noc/informediario/informediario.component';
import { DatosclientesComponent } from './pages/negocio/clientes/datosclientes/datosclientes.component';
import { AgendatecnicosComponent } from './pages/negocio/tecnico/agendatecnicos/agendatecnicos.component';
import { MorososComponent } from './pages/negocio/recuperacion/morosos/morosos.component';
import { usuariosGuard } from './guards/administrador/usuarios.guard';
import { inventarioGuard } from './guards/bodega/inventario.guard';
import { recupcartGuard } from './guards/Recuperacion/recupcart.guard';
import { ClientesComponent } from './pages/negocio/clientes/clientes.component';
import { DataclientesComponent } from './pages/negocio/administrador/dataclientes/dataclientes.component';
import { RegistrosoporteComponent } from './pages/negocio/tecnico/registrosoporte/registrosoporte.component';
import { RecuperacionComponent } from './pages/negocio/recuperacion/recuperacion.component';
import { IngresarEquiposComponent } from './pages/negocio/bodega/ingresar-equipos/ingresar-equipos.component';
import { DespacharEquiposComponent } from './pages/negocio/bodega/despachar-equipos/despachar-equipos.component';
import { AsignarEquiposComponent } from './pages/negocio/bodega/asignar-equipos/asignar-equipos.component';
import { MapeoCajasComponent } from './pages/negocio/noc/mapeo-cajas/mapeo-cajas.component';
import { SoporteTecnicoComponent } from './pages/negocio/noc/soporte-tecnico/soporte-tecnico.component';
import { MapaMorososComponent } from './pages/negocio/recuperacion/mapa-morosos/mapa-morosos.component';
import { GestionMorososComponent } from './pages/negocio/recuperacion/gestion-morosos/gestion-morosos.component';
import { ingresarEquiposGuard } from './guards/bodega/ingresar-equipos.guard';

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
        path: 'ingresar-equipos',
        component: IngresarEquiposComponent,
        canActivate: [ingresarEquiposGuard],
      },
      { path: 'despachar-equipos', component: DespacharEquiposComponent },
      { path: 'asignar-equipos', component: AsignarEquiposComponent },
    ],
  },

  //CLIENTES
  {
    path: 'home/clientes',
    component: NocComponent,
    children: [{ path: 'datos', component: DatosclientesComponent }],
  },

  //NOC
  {
    path: 'home/noc',
    component: NocComponent,
    children: [
      { path: 'informediario', component: InformediarioComponent },
      { path: 'mapeo-cajas', component: MapeoCajasComponent },
      { path: 'soporte-tecnico', component: SoporteTecnicoComponent },
    ],
  },

  //RECUPERACION
  {
    path: 'home/recuperacion',
    component: RecuperacionComponent,
    children: [
      { path: 'morosos', component: MorososComponent },
      { path: 'mapa-morosos', component: MapaMorososComponent },
      { path: 'gestion-morosos', component: GestionMorososComponent },
    ],
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
