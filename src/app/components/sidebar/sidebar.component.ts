import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AutenticacionService } from '../../services/sistema/autenticacion.service';

import { DataSharingService } from '../../services/data-sharing.service';
import { SoportesService } from '../../services/negocio_latacunga/soportes.service';
import { SoketService } from '../../services/socket_io/soket.service'; // ✅ Usa tu servicio
import { Iusuarios } from '../../interfaces/sistema/iusuarios.interface';

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
  soketService = inject(SoketService); // ✅ Inyección correcta del servicio
  dataSharingService = inject(DataSharingService);

  data!: Iusuarios;

  soportesPendientesCount = 0;
  soportesNocCount = 0;

  arrAdmin: string[] = [];
  arrBodega: string[] = [];
  arrNoc: string[] = [];
  arrTecnico: string[] = [];
  arrClientes: string[] = [];
  arrRecuperacion: string[] = [];

  async ngOnInit() {
    this.soketService.connectSocket();

    this.dataSharingService.currentData.subscribe((data) => {
      this.soportesPendientesCount = data.pendientes;
      this.soportesNocCount = data.noc;
    });

    try {
      const datosUsuario = await this.authService.getUsuarioAutenticado();

      console.log(datosUsuario);
      this.data = datosUsuario;

      this.arrAdmin = this.data.rol.filter((rol: string) =>
        rol.startsWith('A')
      );
      this.arrBodega = this.data.rol.filter((rol: string) =>
        rol.startsWith('B')
      );
      this.arrNoc = this.data.rol.filter((rol: string) => rol.startsWith('N'));

      this.arrTecnico = this.data.rol.filter((rol: string) =>
        rol.startsWith('T')
      );
      this.arrClientes = this.data.rol.filter((rol: string) =>
        rol.startsWith('C')
      );
      this.arrRecuperacion = this.data.rol.filter((rol: string) =>
        rol.startsWith('R')
      );

      // Solo si es NOC conectamos eventos del socket
      if (this.arrNoc.length > 0) {
        await this.obtenerSoportesPendientes();

        this.soketService.on('actualizarSoportes', async () => {
          console.log('🔄 Recibiendo actualización de soportes');
          const soportesPrevios = this.soportesPendientesCount;
          await this.obtenerSoportesPendientes();
          if (this.soportesPendientesCount > soportesPrevios) {
            this.reproducirSonido();
          }
        });

        this.soketService.on('soporteCreado', async () => {
          console.log('📢 Nuevo soporte creado');
          const soportesPrevios = this.soportesPendientesCount;
          await this.obtenerSoportesPendientes();
          if (this.soportesPendientesCount > soportesPrevios) {
            this.reproducirSonido();
          }
        });
      }
    } catch (error) {
      console.error('❌ No se pudo obtener datos del usuario', error);
      // Redirigir o manejar error de sesión
    }
  }

  async obtenerSoportesPendientes() {
    try {
      const soportesPendientes = await this.soporteService.getAllPendientes();
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
    this.soketService.disconnectSocket(); // 🔴 primero desconectamos socket

    await this.authService.logout(this.data.id!);
    window.close(); // o this.router.navigateByUrl('/login')

    //this.router.navigateByUrl('/login');
  }

  onClickMenu() {
    this.isMenu = !this.isMenu;
  }

  async ngOnDestroy() {
    //this.soketService.disconnectSocket(); // ✅ desconectar también al destruir
    //  localStorage.removeItem('token_proyecto');
    await this.authService.logout(this.data.id!);

    //this.router.navigateByUrl('/login');
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
