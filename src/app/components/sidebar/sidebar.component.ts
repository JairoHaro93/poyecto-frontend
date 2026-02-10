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
    try {
      const datosUsuario =
        this.authService.usuarioEnMemoria ||
        (await this.authService.hydrateSessionOnce());

      if (!datosUsuario) return;

      this.data = datosUsuario;

      // normaliza roles (evita espacios raros)
      const roles = (this.data.rol ?? []).map((r) => r.trim());
      this.arrAdmin = roles.filter((r) => r.startsWith('A'));
      this.arrBodega = roles.filter((r) => r.startsWith('B'));
      this.arrNoc = roles.filter((r) => r.startsWith('N'));
      this.arrTecnico = roles.filter((r) => r.startsWith('T'));
      this.arrClientes = roles.filter((r) => r.startsWith('C'));
      this.arrRecuperacion = roles.filter((r) => r.startsWith('R'));

      // ya con sesión ok, ahora sí el resto
      this.obtenerSoportesPendientes();
      this.cargarPreAgenda();

      try {
        await this.soketService.connectSocket();
        this.configurarListenersSidebar();
      } catch (e) {
        console.error('❌ Error connectSocket en sidebar:', e);
      }
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
  // --- callbacks como propiedades (referencia estable) ---
  private cbSoporteCreadoNOC = () => {
    this.reproducirSonido();
    this.obtenerSoportesPendientes();
  };

  private cbSoporteActualizadoNOC = () => {
    this.obtenerSoportesPendientes();
  };

  private cbTrabajoPreagendadoNOC = () => {
    this.reproducirSonido();
    this.cargarPreAgenda();
  };

  private cbTrabajoAgendadoNOC = () => {
    this.cargarPreAgenda();
  };

  private cbTrabajoCulminadoNOC = () => {
    this.cargarPreAgenda();
  };

  // ✅ técnico (sin inline)
  private cbTrabajoAgendadoTecnico = () => this.reproducirSonido();
  private cbTrabajoCulminadoTecnico = () => this.reproducirSonido();

  private configurarListenersSidebar() {
    if (this.arrNoc.length > 0) {
      this.soketService.on('soporteCreadoNOC', this.cbSoporteCreadoNOC);
      this.soketService.on(
        'soporteActualizadoNOC',
        this.cbSoporteActualizadoNOC,
      );

      this.soketService.on(
        'trabajoPreagendadoNOC',
        this.cbTrabajoPreagendadoNOC,
      );
      this.soketService.on('trabajoAgendadoNOC', this.cbTrabajoAgendadoNOC);
      this.soketService.on('trabajoCulminadoNOC', this.cbTrabajoCulminadoNOC);
    }

    if (this.arrTecnico.length > 0) {
      this.soketService.on(
        'trabajoAgendadoTecnico',
        this.cbTrabajoAgendadoTecnico,
      );
      this.soketService.on(
        'trabajoCulminadoTecnico',
        this.cbTrabajoCulminadoTecnico,
      );
    }
  }

  ngOnDestroy(): void {
    // NOC
    this.soketService.off('soporteCreadoNOC', this.cbSoporteCreadoNOC);
    this.soketService.off(
      'soporteActualizadoNOC',
      this.cbSoporteActualizadoNOC,
    );
    this.soketService.off(
      'trabajoPreagendadoNOC',
      this.cbTrabajoPreagendadoNOC,
    );
    this.soketService.off('trabajoAgendadoNOC', this.cbTrabajoAgendadoNOC);
    this.soketService.off('trabajoCulminadoNOC', this.cbTrabajoCulminadoNOC);

    // Técnico
    this.soketService.off(
      'trabajoAgendadoTecnico',
      this.cbTrabajoAgendadoTecnico,
    );
    this.soketService.off(
      'trabajoCulminadoTecnico',
      this.cbTrabajoCulminadoTecnico,
    );
  }
}
