import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMap } from '@angular/google-maps';

import { environment } from '../../../../../environments/environment.development';
import { ClientesService } from '../../../../services/negocio_atuntaqui/clientes.service';
import { Iclientes_mapa } from '../../../../interfaces/negocio/clientes/iclientes_mapa.interface';
import { MapaclientesComponent } from './mapaclientes/mapaclientes.component';

type EnlaceFiltro = 'TODOS' | 'WIFI' | 'FTTH';
type MorosidadModo = 'GTE' | 'EQ';
type CategoriaFiltro =
  | 'TODOS'
  | 'ACTIVOS'
  | 'ACTIVO_PAGADO'
  | 'ACTIVO_CON_DEUDA'
  | 'ELIMINADOS'
  | 'ELIMINADO_SIN_DEUDA'
  | 'ELIMINADO_CON_DEUDA';

@Component({
  selector: 'app-dataclientes',
  standalone: true,
  imports: [GoogleMap, MapaclientesComponent, FormsModule, CommonModule],
  templateUrl: './dataclientes.component.html',
  styleUrl: './dataclientes.component.css',
})
export class DataclientesComponent {
  private clienteService = inject(ClientesService);

  // ===== MAPA =====
  myposition = signal<any>('');
  zoom = signal<number>(12);
  isGoogleMapsLoaded = false;

  private readonly DEFAULT_CENTER = { lat: -0.9398, lng: -78.616569 };

  // ===== DATA =====
  clientelista: Iclientes_mapa[] = [];
  marcasList: any[] = [];

  // ===== UI/UX =====
  cargando = false;
  isReady = false;
  busqueda = '';
  nombresFiltrados: string[] = [];

  busquedaInput = '';
  busquedaSeleccionada = '';

  // ===== FILTROS FRONT (rápidos, no recargan) =====
  enlaceFiltro: EnlaceFiltro = 'TODOS';
  categoriaFiltro: CategoriaFiltro = 'TODOS';
  // si quieres que por defecto arranque mostrando solo activos:
  // categoriaFiltro: CategoriaFiltro = 'ACTIVOS';

  // ===== FILTROS BACK (recargan desde SQL) =====
  sucursalId = 2;
  morosidadModo: MorosidadModo = 'GTE';
  morosidadMeses = 0; // 0 = sin filtro
  incluirEliminados = true;

  // ===== VERIFICADOR (opcional) =====
  enableVerificador = false;

  verifOrdIns = '';
  verifLoading = false;
  verifError = '';
  verifData: any = null;

  private nextFrame(): Promise<void> {
    return new Promise((r) => requestAnimationFrame(() => r()));
  }

  private async settleFrames(): Promise<void> {
    await this.nextFrame();
    await this.nextFrame();
  }

  async ngOnInit() {
    try {
      this.isReady = false;
      this.cargando = true;

      this.loadGoogleMapsScript();

      await this.cargarClientesMapaDesdeBack();

      await this.settleFrames();
      this.isReady = true;
    } catch (e) {
      console.error(e);
      this.isReady = true;
    } finally {
      this.cargando = false;
    }
  }

  private loadGoogleMapsScript() {
    const existing = document.querySelector('script[data-gmaps="1"]');
    if (existing) {
      this.isGoogleMapsLoaded = true;
      this.initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.setAttribute('data-gmaps', '1');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.token_map}`;
    script.defer = true;
    script.async = true;

    script.onload = () => {
      this.isGoogleMapsLoaded = true;
      this.initializeMap();
    };

    script.onerror = () => console.error('Error al cargar Google Maps');
    document.head.appendChild(script);
  }

  private initializeMap() {
    if (!this.isGoogleMapsLoaded) return;
    const center = new google.maps.LatLng(
      this.DEFAULT_CENTER.lat,
      this.DEFAULT_CENTER.lng,
    );
    this.myposition.set(center);
    this.zoom.set(12);
  }

  async cargarClientesMapaDesdeBack() {
    try {
      this.cargando = true;

      this.clientelista = await this.clienteService.getInfoClientesMapa({
        suc_id: this.sucursalId,
        num_meses: this.morosidadMeses,
        meses_modo: this.morosidadModo,
        incluir_eliminados: this.incluirEliminados,
      });

      this.actualizarSugerencias();
      this.aplicarFiltrosLocales();
    } catch (e) {
      console.error(e);
    } finally {
      this.cargando = false;
    }
  }

  filtrarClientes() {
    this.aplicarFiltrosLocales();
  }

  private aplicarFiltrosLocales() {
    this.cargando = true;

    setTimeout(() => {
      this.marcasList = this.clientelista.flatMap((cliente) =>
        cliente.servicios
          .filter((servicio) => {
            const pasaCategoria = this.cumpleCategoriaFiltro(servicio);

            const pasaEnlace =
              this.enlaceFiltro === 'TODOS' ||
              servicio.enlace === this.enlaceFiltro;

            const pasaBusqueda =
              this.busquedaSeleccionada === '' ||
              cliente.nombre_completo === this.busquedaSeleccionada;

            return pasaCategoria && pasaEnlace && pasaBusqueda;
          })
          .map((servicio) => {
            const categoria = this.getCategoria(servicio);
            return {
              nombre: cliente.nombre_completo,
              deuda: servicio.deuda,
              meses_deuda: servicio.meses_deuda,
              id: servicio.orden_instalacion,
              coordenadas: servicio.coordenadas,
              enlace: servicio.enlace,
              ip: servicio.ip,
              categoria,
            };
          }),
      );

      this.cargando = false;
    }, 150);
  }

  private cumpleCategoriaFiltro(s: any): boolean {
    const categoria = this.getCategoria(s);

    switch (this.categoriaFiltro) {
      case 'TODOS':
        return true;

      case 'ACTIVOS':
        return (
          categoria === 'ACTIVO_PAGADO' || categoria === 'ACTIVO_CON_DEUDA'
        );

      case 'ELIMINADOS':
        return (
          categoria === 'ELIMINADO_SIN_DEUDA' ||
          categoria === 'ELIMINADO_CON_DEUDA'
        );

      default:
        return categoria === this.categoriaFiltro;
    }
  }

  actualizarSugerencias() {
    const texto = this.busquedaInput.trim().toLowerCase();

    if (!texto) {
      this.nombresFiltrados = [];
      return;
    }

    this.nombresFiltrados = this.clientelista
      .map((c) => c.nombre_completo)
      .filter((nombre) => nombre.toLowerCase().includes(texto))
      .slice(0, 30);
  }

  buscarClienteSeleccionado() {
    const nombre = this.busquedaInput.trim();

    if (nombre === '') {
      this.busquedaSeleccionada = '';
      this.nombresFiltrados = [];
      this.zoom.set(12);
      this.filtrarClientes();
      return;
    }

    const cliente = this.clientelista.find((c) => c.nombre_completo === nombre);
    if (!cliente || !cliente.servicios?.length) {
      return;
    }

    this.busquedaSeleccionada = nombre;
    this.filtrarClientes();

    const servicio = cliente.servicios[0];
    if (servicio?.coordenadas) {
      const [lat, lng] = String(servicio.coordenadas)
        .split(',')
        .map((v) => Number(v.trim()));

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        this.myposition.set(new google.maps.LatLng(lat, lng));
        this.zoom.set(16);
      }
    }
  }

  private getCategoria(s: any): CategoriaFiltro {
    const isEliminado = Number(s.estado_servicio_id) === 10;
    const meses = Number(s.meses_deuda || 0);
    const conDeuda = meses > 0;

    if (!isEliminado && !conDeuda) return 'ACTIVO_PAGADO';
    if (!isEliminado && conDeuda) return 'ACTIVO_CON_DEUDA';
    if (isEliminado && !conDeuda) return 'ELIMINADO_SIN_DEUDA';
    return 'ELIMINADO_CON_DEUDA';
  }

  async verificarServicio() {
    const ord = Number(String(this.verifOrdIns).trim());

    if (!Number.isFinite(ord) || ord <= 0) {
      this.verifError = 'Ingresa un código de servicio (ORD_INS) válido.';
      this.verifData = null;
      return;
    }

    this.verifLoading = true;
    this.verifError = '';
    this.verifData = null;

    try {
      const resp: any = await this.clienteService.getInfoServicioByOrdId(ord);
      const s = resp?.servicios?.[0];

      if (!s) {
        this.verifError = 'No se encontró información para esa orden.';
        return;
      }

      this.verifData = {
        ord_ins: ord,
        cedula: resp.cedula,
        nombre: resp.nombre_completo,

        estadoServicio: s.servicio,
        estadoPago: s.estado,
        meses_deuda: s.meses_deuda ?? 0,
        deuda: s.deuda ?? 0,

        ip: s.ip,
        coordenadas: s.coordenadas,
        direccion: s.direccion,
        referencia: s.referencia,
        plan: s.plan_nombre,
        precio: s.precio,

        cortado: s.cortado,
        prorroga: s.prorroga,
        fecha_prorroga: s.fecha_prorroga,
        onu: s.onu,
      };
    } catch (e: any) {
      this.verifError =
        e?.error?.message || e?.message || 'Error consultando el servicio.';
    } finally {
      this.verifLoading = false;
    }
  }

  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'satellite',
    gestureHandling: 'greedy', // permite zoom con rueda sin pedir Ctrl
    scrollwheel: true,
    clickableIcons: false,
    streetViewControl: false,
    mapTypeControl: true,
    fullscreenControl: true,
  };

  mostrarFiltros = true;

  toggleFiltros() {
    this.mostrarFiltros = !this.mostrarFiltros;
  }
}
