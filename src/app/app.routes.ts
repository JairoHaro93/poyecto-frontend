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
import { informacionClientesGuard } from './guards/administrador/informacion-clientes.guard';
import { despacharEquiposGuard } from './guards/bodega/despachar-equipos.guard';
import { asignarEquiposGuard } from './guards/bodega/asignar-equipos.guard';
import { datosClientesGuard } from './guards/clientes/datos-clientes.guard';
import { informeDiarioGuard } from './guards/noc/informe-diario.guard';
import { mapeoCajasGuard } from './guards/noc/mapeo-cajas.guard';
import { soporteTecnicoGuard } from './guards/noc/soporte-tecnico.guard';
import { morososGuard } from './guards/recuperacion/morosos.guard';
import { mapaMorososGuard } from './guards/recuperacion/mapa-morosos.guard';
import { gestionMorososGuard } from './guards/recuperacion/gestion-morosos.guard';
import { miAgendaGuard } from './guards/tecnico/mi-agenda.guard';
import { registroSoporteGuard } from './guards/tecnico/registro-soporte.guard';
import { InfoSopComponent } from './pages/negocio/noc/info-sop/info-sop.component';
import { AsignarTrabajosComponent } from './pages/negocio/noc/asignar-trabajos/asignar-trabajos.component';
import { AgendaComponent } from './pages/negocio/noc/agenda/agenda.component';

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
        path: 'data-clientes',
        component: DataclientesComponent,
        canActivate: [informacionClientesGuard],
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
      {
        path: 'despachar-equipos',
        component: DespacharEquiposComponent,
        canActivate: [despacharEquiposGuard],
      },
      {
        path: 'asignar-equipos',
        component: AsignarEquiposComponent,
        canActivate: [asignarEquiposGuard],
      },
    ],
  },

  //CLIENTES
  {
    path: 'home/clientes',
    component: NocComponent,
    children: [
      {
        path: 'datos',
        component: DatosclientesComponent,
        canActivate: [datosClientesGuard],
      },
    ],
  },

  //NOC
  {
    path: 'home/noc',
    component: NocComponent,
    children: [
      {
        path: 'informediario',
        component: InformediarioComponent,
        canActivate: [informeDiarioGuard],
      },
      {
        path: 'mapeo-cajas',
        component: MapeoCajasComponent,
        canActivate: [mapeoCajasGuard],
      },
      {
        path: 'asignar-trabajos',
        component: AsignarTrabajosComponent,
        canActivate: [mapeoCajasGuard],
      },

      {
        path: 'soporte-tecnico',
        component: SoporteTecnicoComponent,
        canActivate: [soporteTecnicoGuard],
      },
      {
        path: 'info-sop/:id_sop/:ord_ins',
        component: InfoSopComponent,
        canActivate: [soporteTecnicoGuard],
      },
      {
        path: 'agenda',
        component: AgendaComponent,
      },
    ],
  },

  //RECUPERACION
  {
    path: 'home/recuperacion',
    component: RecuperacionComponent,
    children: [
      {
        path: 'morosos',
        component: MorososComponent,
        canActivate: [morososGuard],
      },
      {
        path: 'mapa-morosos',
        component: MapaMorososComponent,
        canActivate: [mapaMorososGuard],
      },
      {
        path: 'gestion-morosos',
        component: GestionMorososComponent,
        canActivate: [gestionMorososGuard],
      },
    ],
  },

  //TECNICO
  {
    path: 'home/tecnico',
    component: NocComponent,
    children: [
      {
        path: 'mi-agenda-tec',
        component: AgendatecnicosComponent,
        canActivate: [miAgendaGuard],
      },
      {
        path: 'registrosop',
        component: RegistrosoporteComponent,
        canActivate: [registroSoporteGuard],
      },
    ],
  },

  { path: '**', redirectTo: 'home' }, //ruta 404
];
