import { Component, inject, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AutenticacionService } from '../../services/sistema/autenticacion.service';
import { JwtPayload } from 'jwt-decode';
import { DataSharingService } from '../../services/data-sharing.service';
import { SoportesService } from '../../services/negocio_latacunga/soportes.service';
import { io } from 'socket.io-client';
import { environment } from '../../../environments/environment';

interface CustomPayload extends JwtPayload {
  usuario_id: number;
  usuario_usuario: string;
  usuario_rol: [];
  usuario_nombre: string;
}
declare var bootstrap: any;

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnDestroy {
  isMenu = false;
  // private socket = io('http://localhost:3000'); // Servidor WebSocket
  private socket = io(`${environment.API_WEBSOKETS_IO}`); // Conexión con WebSocket

  // Inyección de servicios
  router = inject(Router);
  authService = inject(AutenticacionService);
  soporteService = inject(SoportesService);
  constructor(private dataSharingService: DataSharingService) {}

  // Datos del usuario
  data: CustomPayload = {
    usuario_id: 0,
    usuario_usuario: '',
    usuario_rol: [],
    usuario_nombre: '',
  };

  soportesPendientesCount: number = 0;
  soportesNocCount: number = 0;
  arrAdmin: string[] = [];
  arrBodega: string[] = [];
  arrNoc: string[] = [];
  arrTecnico: string[] = [];
  arrClientes: string[] = [];
  arrRecuperacion: string[] = [];

  async ngOnInit() {
    this.dataSharingService.currentData.subscribe((data) => {
      this.soportesPendientesCount = data.pendientes;
      this.soportesNocCount = data.noc;
      console.log('Datos recibidos en Sidebar:', data);
    });

    // Obtener datos del usuario
    const datosUsuario = this.authService.datosLogged();

    if (datosUsuario) {
      this.data = datosUsuario;
      this.arrAdmin = this.data.usuario_rol.filter((rol: string) =>
        rol.startsWith('A')
      );
      this.arrBodega = this.data.usuario_rol.filter((rol: string) =>
        rol.startsWith('B')
      );
      this.arrNoc = this.data.usuario_rol.filter((rol: string) =>
        rol.startsWith('N')
      );
      this.arrTecnico = this.data.usuario_rol.filter((rol: string) =>
        rol.startsWith('T')
      );
      this.arrClientes = this.data.usuario_rol.filter((rol: string) =>
        rol.startsWith('C')
      );
      this.arrRecuperacion = this.data.usuario_rol.filter((rol: string) =>
        rol.startsWith('R')
      );
    }

    if (this.arrNoc.length > 0) {
      // Cargar número inicial de soportes pendientes

      console.log(' WEBSOCKET NOC ');
      await this.obtenerSoportesPendientes();

      // Escuchar evento de actualización desde el servidor
      this.socket.on('actualizarSoportes', async () => {
        console.log(
          '🔄 Recibiendo actualización de soportes en SidebarComponent'
        );
        const soportesPrevios = this.soportesPendientesCount;
        await this.obtenerSoportesPendientes();
        if (this.soportesPendientesCount > soportesPrevios) {
          this.reproducirSonido();
        }
      });

      // Escuchar evento cuando se crea un nuevo soporte
      this.socket.on('soporteCreado', async () => {
        console.log('📢 Se ha creado un nuevo soporte.');
        const soportesPrevios = this.soportesPendientesCount;
        await this.obtenerSoportesPendientes();
        if (this.soportesPendientesCount > soportesPrevios) {
          this.reproducirSonido();
        }
      });
    }
  }

  async obtenerSoportesPendientes() {
    try {
      const soportesPendientes = await this.soporteService.getAllPendientes();
      this.soportesPendientesCount = soportesPendientes.length;
      console.log(
        '📢 Soportes pendientes actualizados:',
        this.soportesPendientesCount
      );
    } catch (error) {
      console.error('❌ Error al obtener soportes pendientes:', error);
    }
  }

  reproducirSonido() {
    const audio = new Audio('./sounds/ding_sop.mp3'); // Ruta del archivo de sonido
    audio
      .play()
      .catch((error) => console.error('❌ Error al reproducir sonido:', error));
  }

  async onClickLogout() {
    localStorage.removeItem('token_proyecto');
    await this.authService.logout(this.data.usuario_id);
    this.router.navigateByUrl('/login');
  }

  onClickMenu() {
    this.isMenu = !this.isMenu;
  }

  ngOnDestroy() {
    this.socket.disconnect();
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
