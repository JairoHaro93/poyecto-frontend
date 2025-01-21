import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AutenticacionService } from '../../services/autenticacion.service';
import { JwtPayload } from 'jwt-decode';
interface CustomPayload extends JwtPayload {
  usuario_id: number;
  usuario_usuario: string;
  usuario_rol: [];
}
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  isMenu = false;

  // Inyección de servicios
  router = inject(Router);
  authService = inject(AutenticacionService);

  // Inicializamos `data` con valores predeterminados
  data: CustomPayload = { usuario_id: 0, usuario_usuario: '', usuario_rol: [] };

  arrAdmin: string[] = [];
  arrBodega: string[] = [];
  arrNoc: string[] = [];
  arrTecnico: string[] = [];
  arrClientes: string[] = [];

  ngOnInit() {
    // Intentamos obtener los datos del usuario
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
    }
    console.table(this.data?.usuario_rol);
  }

  onClickLogout() {
    localStorage.removeItem('token_proyecto');
    this.router.navigateByUrl('/login');
  }

  onClickMenu() {
    this.isMenu = !this.isMenu;
  }
}
