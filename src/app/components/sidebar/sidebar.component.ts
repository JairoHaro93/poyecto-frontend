import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AutenticacionService } from '../../services/sistema/autenticacion.service';
import { DataSharingService } from '../../services/data-sharing.service';
import { SoportesService } from '../../services/negocio_latacunga/soportes.service';
import { SoketService } from '../../services/socket_io/soket.service';
import { Iusuarios } from '../../interfaces/sistema/iusuarios.interface';
import { AgendaService } from '../../services/negocio_latacunga/agenda.service';
import { Iagenda } from '../../interfaces/negocio/agenda/iagenda.interface';

declare var bootstrap: any;

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  isMenu = false;

  router = inject(Router);
  authService = inject(AutenticacionService);
  soporteService = inject(SoportesService);
  agendaService = inject(AgendaService);
  soketService = inject(SoketService);
  dataSharingService = inject(DataSharingService);

  data: Iusuarios = {
    id: 0,
    usuario: '',
    nombre: '',
    apellido: '',
    ci: '',
    password: '',
    fecha_cont: new Date(),
    fecha_nac: new Date(),
    genero: 'M',
    rol: [],

    sucursal_id: null,
    sucursal_codigo: null,
    sucursal_nombre: null,
    departamento_id: null,
    departamento_codigo: null,
    departamento_nombre: null,
  };

  soportesPendientesCount = 0;
  soportesRevisadosCount = 0;
  soportesNocCount = 0;
  preAgendaPendientesCount = 0;

  preAgendaList: Iagenda[] = [];

  arrAdmin: string[] = [];
  arrBodega: string[] = [];
  arrNoc: string[] = [];
  arrTecnico: string[] = [];
  arrClientes: string[] = [];
  arrRecuperacion: string[] = [];

  async ngOnInit() {
    this.obtenerSoportesPendientes();
    this.cargarPreAgenda();
    this.soketService.connectSocket();

    this.dataSharingService.currentData.subscribe((data) => {
      this.soportesPendientesCount = data.pendientes;
      this.soportesNocCount = data.noc;
    });

    try {
      // Si ya está en memoria, no vuelve a pegarle a /me
      const datosUsuario =
        this.authService.usuarioEnMemoria ||
        (await this.authService.hydrateSessionOnce());

      if (!datosUsuario) {
        // si no hay sesión válida rediriges si quieres
        // this.router.navigateByUrl('/login');
        return;
      }
      this.data = datosUsuario;

      // 👇 Log de roles en consola
      console.log('👤 Usuario autenticado:', this.data.usuario);
      console.log('🎭 Roles asignados:', this.data.rol);
      console.log('Sucursal / Departamento:', {
        sucursal_id: this.data.sucursal_id,
        sucursal_codigo: this.data.sucursal_codigo,
        sucursal_nombre: this.data.sucursal_nombre,
        departamento_id: this.data.departamento_id,
        departamento_codigo: this.data.departamento_codigo,
        departamento_nombre: this.data.departamento_nombre,
      });

      this.arrAdmin = this.data.rol.filter((rol) => rol.startsWith('A'));
      this.arrBodega = this.data.rol.filter((rol) => rol.startsWith('B'));
      this.arrNoc = this.data.rol.filter((rol) => rol.startsWith('N'));
      this.arrTecnico = this.data.rol.filter((rol) => rol.startsWith('T'));
      this.arrClientes = this.data.rol.filter((rol) => rol.startsWith('C'));
      this.arrRecuperacion = this.data.rol.filter((rol) => rol.startsWith('R'));

      this.soketService.on('soporteCreadoNOC', async () => {
        console.log('📢 soporteCreadoNOC en SIDEBAR');
        const soportesPrevios = this.soportesPendientesCount;
        await this.obtenerSoportesPendientes();
        if (this.soportesPendientesCount > soportesPrevios) {
          this.reproducirSonido();
        }
      });

      this.soketService.on('soporteActualizadoNOC', async () => {
        console.log('📢 soporteActualizadoNOC en SIDEBAR');
        const soportesPrevios = this.soportesPendientesCount;
        await this.obtenerSoportesPendientes();
        if (this.soportesPendientesCount > soportesPrevios) {
          this.reproducirSonido();
        }
      });

      this.soketService.on('trabajoPreagendadoNOC', async () => {
        console.log('📥 trabajoPreagendadoNOC en SIDEBAR');
        const preAgendaPrevio = this.preAgendaPendientesCount;
        await this.cargarPreAgenda();
        if (this.preAgendaPendientesCount > preAgendaPrevio) {
          this.reproducirSonido();
        }
      });
    } catch (error) {
      console.error('❌ No se pudo obtener datos del usuario', error);
    }
  }

  async cargarPreAgenda() {
    this.preAgendaList = await this.agendaService.getPreAgenda();
    this.preAgendaPendientesCount = this.preAgendaList.length;
  }

  async obtenerSoportesPendientes() {
    try {
      const soportesPendientes = await this.soporteService.getAllPendientes();
      const soportesRevisados = await this.soporteService.getAllSopRevisados();
      this.soportesRevisadosCount = soportesRevisados.length;
      this.soportesPendientesCount = soportesPendientes.length;
    } catch (error) {
      console.error('❌ Error al obtener soportes pendientes:', error);
    }
  }

  reproducirSonido() {
    const audio = new Audio('./sounds/ding_sop.mp3');
    audio
      .play()
      .catch((err) => console.error('🎵 Error al reproducir sonido:', err));
  }

  async onClickLogout() {
    this.soketService.disconnect();
    await this.authService.logout(this.data.id!);
    this.router.navigateByUrl('/login');
  }

  onClickMenu() {
    this.isMenu = !this.isMenu;
  }

  async ngOnDestroy() {
    // si quieres seguir cerrando sesión al destruir el sidebar, puedes dejar esto
    // pero normalmente con el botón de "Cerrar sesión" es suficiente.
    // await this.authService.logout(this.data.id!);
  }

  toggleCollapse(targetId: string) {
    const allPanels = document.querySelectorAll('.accordion-collapse');
    allPanels.forEach((panel: any) => {
      if (panel.id !== targetId && panel.classList.contains('show')) {
        const instance =
          bootstrap.Collapse.getInstance(panel) ||
          new bootstrap.Collapse(panel, { toggle: false });
        instance.hide();
      }
    });

    const target = document.getElementById(targetId);
    if (target) {
      const instance =
        bootstrap.Collapse.getInstance(target) ||
        new bootstrap.Collapse(target, { toggle: false });
      target.classList.contains('show') ? instance.hide() : instance.show();
    }
  }
}
