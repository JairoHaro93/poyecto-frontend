import { Component, inject, signal } from '@angular/core';
import { environment } from '../../../../../environments/environment.development';
import { GoogleMap } from '@angular/google-maps';
import { MapaclientesComponent } from './mapaclientes/mapaclientes.component';
import { Iclientes } from '../../../../interfaces/negocio/clientes/iclientes.interface';
import { ClientesService } from '../../../../services/negocio_atuntaqui/clientes.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Iclientes_mapa } from '../../../../interfaces/negocio/clientes/iclientes_mapa.interface';

@Component({
  selector: 'app-dataclientes',
  standalone: true,
  imports: [GoogleMap, MapaclientesComponent, FormsModule, CommonModule],
  templateUrl: './dataclientes.component.html',
  styleUrl: './dataclientes.component.css',
})
export class DataclientesComponent {
  clienteService = inject(ClientesService);
  myposition = signal<any>(''); // Posición del mapa
  zoom = signal<number>(12); // Nivel de zoom inicial
  isGoogleMapsLoaded = false;
  clientelista: Iclientes_mapa[] = [];
  marcasList: any[] = [];
  filtro: string = 'TODOS';
  filtroDeuda: string = 'TODOS';
  busqueda: string = '';
  nombresFiltrados: string[] = [];
  cargando = false; // Nueva variable para la animación de carga
  // 👇 NUEVO: control de reveal suave
  isReady = false;

  // 👇 NUEVO: helpers para esperar frames de render
  private nextFrame(): Promise<void> {
    return new Promise((r) => requestAnimationFrame(() => r()));
  }
  private async settleFrames(): Promise<void> {
    await this.nextFrame();
    await this.nextFrame();
  }

  // Centro por defecto: (-0.939800, -78.616569)
  private readonly DEFAULT_CENTER = { lat: -0.9398, lng: -78.616569 };
  async ngOnInit() {
    try {
      this.isReady = false; // 👈 ocultamos el contenido real
      this.cargando = true;

      // Cargar Google Maps
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.token_map}`;
      script.defer = true;
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        this.isGoogleMapsLoaded = true;
        this.initializeMap(); // centrado por defecto
      };
      script.onerror = () => console.error('Error al cargar Google Maps');

      // Cargar clientes
      this.clientelista = await this.clienteService.getInfoClientesMapa();

      // Evitar bloqueo UI; mapear y terminar “cargando”
      setTimeout(() => {
        this.marcasList = this.mapearClientes(this.clientelista);
        this.cargando = false;
      }, 300);

      // 👇 Espera a que el DOM asiente antes de mostrar
      await this.settleFrames();
      this.isReady = true;
    } catch (e) {
      console.error(e);
      this.isReady = true; // en error, evita dejar la vista en blanco
      this.cargando = false;
    }
  }

  private initializeMap() {
    if (this.isGoogleMapsLoaded) {
      // 👇 Centrado por defecto, sin geolocalización del navegador
      const center = new google.maps.LatLng(-0.9398, -78.616569);
      this.myposition.set(center);
      this.zoom.set(12);
    }
  }
  //FUNCION PARA BUSCAR LA GEOLOCALIZACION DEL NAVEGADOR
  /*
  private initializeMap() {
    if (this.isGoogleMapsLoaded) {
      navigator.geolocation.getCurrentPosition((position) => {
        let center = new google.maps.LatLng(
          position.coords.latitude,
          position.coords.longitude
        );
        this.myposition.set(center);
        this.zoom.set(12);
      });
    }
  }



  private initializeMap() {
    if (!this.isGoogleMapsLoaded) return;
    // Usar centro por defecto
    const center = new google.maps.LatLng(
      this.DEFAULT_CENTER.lat,
      this.DEFAULT_CENTER.lng
    );
    this.myposition.set(center);
    this.zoom.set(12);
  }
*/
  actualizarSugerencias() {
    const texto = this.busqueda.trim().toLowerCase();
    if (texto.length > 0) {
      this.nombresFiltrados = this.clientelista
        .map((c) => c.nombre_completo)
        .filter((nombre) => nombre.toLowerCase().includes(texto));
    } else {
      this.nombresFiltrados = [];
    }
  }

  buscarClienteSeleccionado() {
    // Verificar si el nombre ingresado está en la lista de clientes
    const clienteSeleccionado = this.clientelista.find(
      (c) => c.nombre_completo === this.busqueda
    );

    if (clienteSeleccionado && clienteSeleccionado.servicios.length > 0) {
      this.filtrarClientes();

      // Tomar la primera coordenada disponible del cliente
      const servicio = clienteSeleccionado.servicios[0];
      if (servicio.coordenadas) {
        const [lat, lng] = servicio.coordenadas.split(',').map(Number);
        this.myposition.set(new google.maps.LatLng(lat, lng));
        this.zoom.set(16); // Aumenta el zoom al centrarse en el cliente
      }
    } else {
      // Si el usuario borra el campo, vuelve a mostrar todos los clientes y restablece el zoom
      if (this.busqueda.trim() === '') {
        this.marcasList = this.mapearClientes(this.clientelista);
        this.zoom.set(12);
      }
    }
  }

  async filtrarClientes() {
    this.cargando = true; // Inicia la animación de carga

    // Usar setTimeout para evitar congelamiento de UI
    setTimeout(() => {
      this.marcasList = this.clientelista.flatMap((cliente) =>
        cliente.servicios
          .filter(
            (servicio) =>
              (this.filtro === 'TODOS' || servicio.enlace === this.filtro) &&
              (this.filtroDeuda === 'TODOS' ||
                (this.filtroDeuda === 'CON_DEUDA' &&
                  servicio.meses_deuda > 1)) &&
              (this.busqueda === '' ||
                cliente.nombre_completo === this.busqueda) // Búsqueda exacta
          )
          .map((servicio) => ({
            nombre: cliente.nombre_completo,
            deuda: servicio.deuda,
            meses_deuda: servicio.meses_deuda,
            id: servicio.orden_instalacion,
            coordenadas: servicio.coordenadas,
            enlace: servicio.enlace,
            ip: servicio.ip,
          }))
      );

      this.cargando = false; // Termina la animación de carga
    }, 500);
  }

  private mapearClientes(lista: Iclientes_mapa[]) {
    return lista.flatMap((cliente) =>
      cliente.servicios.map((servicio) => ({
        nombre: cliente.nombre_completo,
        deuda: servicio.deuda,
        meses_deuda: servicio.meses_deuda,
        id: servicio.orden_instalacion,
        coordenadas: servicio.coordenadas,
        enlace: servicio.enlace,
        ip: servicio.ip,
      }))
    );
  }
}
