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

import { InfoSopComponent } from './pages/negocio/noc/info-sop/info-sop.component';
import { AsignarTrabajosComponent } from './pages/negocio/noc/asignar-trabajos/asignar-trabajos.component';
import { AgendaComponent } from './pages/negocio/noc/agenda/agenda.component';
import { LayoutComponent } from './pages/sistema/layout/layout.component';
import { permisosGuard } from './guards/permisos.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },

  {
    path: 'home',
    component: LayoutComponent,
    canActivate: [tokenGuard],
    children: [
      // ADMINISTRADOR
      {
        path: 'administrador',
        component: AdministradorComponent,
        children: [
          {
            path: 'usuarios',
            component: UsuariosComponent,
            canActivate: [permisosGuard('AUsuarios')],
          },
          {
            path: 'data-clientes',
            component: DataclientesComponent,
            canActivate: [permisosGuard('AInformación Clientes')],
          },
          {
            path: 'usuario/:id',
            component: VistausuariosComponent,
            canActivate: [permisosGuard('AUsuarios')],
          },
          {
            path: 'crearusuario',
            component: FormusuariosComponent,
            canActivate: [permisosGuard('AUsuarios')],
          },
          {
            path: 'actualizarusuario/:id',
            component: FormusuariosComponent,
            canActivate: [permisosGuard('AUsuarios')],
          },
        ],
      },

      // BODEGA
      {
        path: 'bodega',
        component: BodegaComponent,
        children: [
          {
            path: 'inventario',
            component: InventarioComponent,
            canActivate: [permisosGuard('BInventario')],
          },
          {
            path: 'ingresar-equipos',
            component: IngresarEquiposComponent,
            canActivate: [permisosGuard('BIngresar Equipos')],
          },
          {
            path: 'despachar-equipos',
            component: DespacharEquiposComponent,
            canActivate: [permisosGuard('BDespachar Equipos')],
          },
          {
            path: 'asignar-equipos',
            component: AsignarEquiposComponent,
            canActivate: [permisosGuard('BAsignar Equipos')],
          },
        ],
      },

      // CLIENTES
      {
        path: 'clientes',
        component: NocComponent,
        children: [
          {
            path: 'datos',
            component: DatosclientesComponent,
            canActivate: [permisosGuard('CDatos de Clientes')],
          },
        ],
      },

      // NOC
      {
        path: 'noc',
        component: NocComponent,
        children: [
          {
            path: 'informediario',
            component: InformediarioComponent,
            canActivate: [permisosGuard('NInforme Diario')],
          },
          {
            path: 'mapeo-cajas',
            component: MapeoCajasComponent,
            canActivate: [permisosGuard('NMapeo Cajas')],
          },
          {
            path: 'asignar-trabajos',
            component: AsignarTrabajosComponent,
            canActivate: [permisosGuard('NSoporte Tecnico')],
          },
          {
            path: 'soporte-tecnico',
            component: SoporteTecnicoComponent,
            canActivate: [permisosGuard('NSoporte Tecnico')],
          },
          {
            path: 'info-sop/:id_sop/:ord_ins',
            component: InfoSopComponent,
            canActivate: [permisosGuard('NSoporte Tecnico')],
          },
          { path: 'agenda', component: AgendaComponent },
        ],
      },

      // RECUPERACIÓN
      {
        path: 'recuperacion',
        component: RecuperacionComponent,
        children: [
          {
            path: 'morosos',
            component: MorososComponent,
            canActivate: [permisosGuard('RMorosos')],
          },
          {
            path: 'mapa-morosos',
            component: MapaMorososComponent,
            canActivate: [permisosGuard('RMapa Morosos')],
          },
          {
            path: 'gestion-morosos',
            component: GestionMorososComponent,
            canActivate: [permisosGuard('RGestion')],
          },
        ],
      },

      // TÉCNICO
      {
        path: 'tecnico',
        component: NocComponent,
        children: [
          {
            path: 'mi-agenda-tec',
            component: AgendatecnicosComponent,
            canActivate: [permisosGuard('TMi Agenda')],
          },
          {
            path: 'registrosop',
            component: RegistrosoporteComponent,
            canActivate: [permisosGuard('TRegistro Soporte')],
          },
        ],
      },
    ],
  },

  { path: '**', redirectTo: 'home' },
];
