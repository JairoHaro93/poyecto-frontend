import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMap } from '@angular/google-maps';
// ⚠️ Ajusta la ruta del environment según tu estructura:
import { environment } from '../../../../../../environments/environment.development';

@Component({
  selector: 'app-mapa-cajas-view',
  standalone: true,
  imports: [CommonModule, GoogleMap],
  templateUrl: './mapa-cajas-view.component.html',
  styleUrls: ['./mapa-cajas-view.component.css'],
})
export class MapaCajasViewComponent {
  // Estado de UI (mismo patrón que Dataclientes)
  isGoogleMapsLoaded = false;
  isReady = false;

  // Signals para centro y zoom (como en tu otro componente)
  myposition = signal<any>('');
  zoom = signal<number>(12);

  // Centro por defecto (Latacunga aprox)
  private readonly DEFAULT_CENTER = { lat: -0.9398, lng: -78.616569 };

  // Helpers para “asentar” frames (idéntico patrón)
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

      // 1) Cargar Google Maps JS API si no está ya cargado
      await this.loadGoogleMapsIfNeeded();

      // 2) Inicializar el mapa con centro por defecto
      this.initializeMap();

      // 3) Pequeña espera para un reveal suave (como tu patrón)
      await this.settleFrames();
      this.isReady = true;
    } catch (e) {
      console.error('Error iniciando mapa de cajas:', e);
      // Evita dejar la vista en blanco
      this.isReady = true;
    }
  }

  private initializeMap() {
    if (!this.isGoogleMapsLoaded) return;
    const center = new google.maps.LatLng(
      this.DEFAULT_CENTER.lat,
      this.DEFAULT_CENTER.lng
    );
    this.myposition.set(center);
    this.zoom.set(12);
  }

  /** Carga el script de Google Maps sólo si hace falta (mismo enfoque que Dataclientes) */
  private loadGoogleMapsIfNeeded(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Si ya está, listo
      if ((window as any).google?.maps) {
        this.isGoogleMapsLoaded = true;
        resolve();
        return;
      }

      // ¿Ya existe un script en carga?
      const existing = document.querySelector<HTMLScriptElement>(
        'script[src*="maps.googleapis.com/maps/api/js"]'
      );

      const onReady = () => {
        this.isGoogleMapsLoaded = true;
        resolve();
      };
      const onError = () => reject(new Error('No se pudo cargar Google Maps'));

      if (existing) {
        // Si el script ya está en el DOM, espera a que cargue o poll de respaldo
        existing.addEventListener('load', onReady, { once: true });
        existing.addEventListener('error', onError, { once: true });
        // Respaldo por si el evento ya ocurrió:
        const start = Date.now();
        const iv = setInterval(() => {
          if ((window as any).google?.maps) {
            clearInterval(iv);
            onReady();
          } else if (Date.now() - start > 15000) {
            clearInterval(iv);
            onError();
          }
        }, 150);
        return;
      }

      // Inyecta el script con tu token (igual que en Dataclientes)
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.token_map}`;
      script.defer = true;
      script.async = true;
      script.onload = onReady;
      script.onerror = onError;
      document.head.appendChild(script);
    });
  }
}
