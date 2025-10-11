import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  HostListener,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { distinctUntilChanged, startWith } from 'rxjs/operators';

import { Isoportes } from '../../../../interfaces/negocio/soportes/isoportes.interface';
import { SoportesService } from '../../../../services/negocio_latacunga/soportes.service';

// 👇 Usa tu interfaz y servicio reales
import { Iagenda } from '../../../../interfaces/negocio/agenda/iagenda.interface';
import { AgendaService } from '../../../../services/negocio_latacunga/agenda.service';

@Component({
  selector: 'app-informediario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './informediario.component.html',
  styleUrls: ['./informediario.component.css'],
})
export class InformediarioComponent implements OnInit {
  private soporteService = inject(SoportesService);
  private agendaService = inject(AgendaService); // ← nuevo

  private todayLocal(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  fechaCtrl = new FormControl<string>(this.todayLocal(), { nonNullable: true });

  // ===== Soportes =====
  soportes = signal<Isoportes[]>([]);
  loading = signal<boolean>(false);
  errorMsg = signal<string | null>(null);

  showModal = signal<boolean>(false);
  selected = signal<Isoportes | null>(null);

  total = computed(() => this.soportes().length);
  resueltos = computed(
    () =>
      this.soportes().filter(
        (s) => (s.reg_sop_estado || '').toUpperCase() === 'RESUELTO'
      ).length
  );
  pendientes = computed(
    () =>
      this.soportes().filter(
        (s) => (s.reg_sop_estado || '').toUpperCase() !== 'RESUELTO'
      ).length
  );

  // ===== Agenda (con tu interfaz y servicio) =====
  agenda = signal<Iagenda[]>([]);
  loadingAgenda = signal<boolean>(false);
  errorAgenda = signal<string | null>(null);
  totalAgenda = computed(() => this.agenda().length);

  ngOnInit(): void {
    this.fechaCtrl.valueChanges
      .pipe(startWith(this.fechaCtrl.value), distinctUntilChanged())
      .subscribe(() => {
        this.cargarSoportes();
        this.cargarAgenda(); // ← carga TS de agenda usando tu getAgendaByDate
      });
  }

  // ----- Soportes -----
  private async cargarSoportes() {
    const fecha = this.fechaCtrl.value;
    if (!fecha) return;
    this.loading.set(true);
    this.errorMsg.set(null);
    try {
      const data = await this.soporteService.obtenerSoportesDiario(fecha);
      this.soportes.set(Array.isArray(data) ? data : []);
    } catch (err: any) {
      this.errorMsg.set(err?.message ?? 'No se pudo cargar el informe diario.');
      this.soportes.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  openModal(s: Isoportes) {
    this.selected.set(s);
    setTimeout(() => this.showModal.set(true));
  }
  closeModal() {
    this.showModal.set(false);
    this.selected.set(null);
  }

  // ----- Agenda -----
  private async cargarAgenda() {
    const fecha = this.fechaCtrl.value;
    if (!fecha) return;
    this.loadingAgenda.set(true);
    this.errorAgenda.set(null);
    try {
      const data = await this.agendaService.getAgendaByDate(fecha);
      const cleaned = (Array.isArray(data) ? data : []).map((a) =>
        this.normalizeAgendaItem(a)
      );
      this.agenda.set(cleaned);
      // console.table(this.agenda());
    } catch (err: any) {
      this.errorAgenda.set(err?.message ?? 'No se pudo cargar la agenda.');
      this.agenda.set([]);
    } finally {
      this.loadingAgenda.set(false);
    }
  }

  // ESC para cerrar modal de soportes
  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.showModal()) this.closeModal();
  }

  // track functions (la de agenda te servirá al pintar)
  trackById = (_: number, item: Isoportes) => item.id;
  trackByAgendaId = (_: number, item: Iagenda) => item.id;

  // === helpers de normalización ===
  private toHHMM(v?: string | null): string {
    if (!v) return '';
    // acepta "09:00", "9:0", "09:00:00"
    const m = String(v).match(/^(\d{1,2}):(\d{1,2})(?::\d{1,2})?$/);
    if (!m) return v;
    const hh = m[1].padStart(2, '0');
    const mm = m[2].padStart(2, '0');
    return `${hh}:${mm}`;
  }

  /** Arregla strings tipo "-0.924233,-78,621597" o "-0.913447,,-78.673116".
   *  Devuelve {lat, lng, text} o null si no se puede parsear.
   */
  private fixCoords(
    input?: string | null
  ): { lat: number; lng: number; text: string } | null {
    if (!input) return null;
    let s = String(input).trim().replace(/\s+/g, '');
    // Split por coma y elimina vacíos
    const parts = s.split(',').filter((p) => p !== '');
    if (parts.length < 2) return null;

    let latStr = parts[0].replace(',', '.');
    // Unimos el resto con '.' para resolver casos con coma decimal en lon
    let lonStr = parts.slice(1).join('.').replace(',', '.');

    const lat = parseFloat(latStr);
    const lng = parseFloat(lonStr);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    const text = `${lat},${lng}`;
    return { lat, lng, text };
  }

  /** Normaliza un item Agenda a tu interfaz Iagenda */
  private normalizeAgendaItem(a: Iagenda): Iagenda {
    const tecnicoNum =
      typeof a.age_tecnico === 'string' ? Number(a.age_tecnico) : a.age_tecnico;

    const coords = this.fixCoords(a.age_coordenadas);

    return {
      ...a,
      age_tecnico: Number.isFinite(tecnicoNum) ? tecnicoNum : 0,
      age_hora_inicio: this.toHHMM(a.age_hora_inicio),
      age_hora_fin: this.toHHMM(a.age_hora_fin),
      age_coordenadas: coords ? coords.text : a.age_coordenadas ?? '',
      age_solucion: (a as any).age_solucion ?? '', // viene null en tu payload
    };
  }

  // estado del modal de Agenda
  showAgendaModal = signal<boolean>(false);
  selectedAgenda = signal<Iagenda | null>(null);

  openAgendaModal(a: Iagenda) {
    this.selectedAgenda.set(a);
    setTimeout(() => this.showAgendaModal.set(true));
  }
  closeAgendaModal() {
    this.showAgendaModal.set(false);
    this.selectedAgenda.set(null);
  }

  // Normaliza a MAYÚSCULAS
  private up = (v?: string | null) => (v ?? '').toUpperCase().trim();

  // CONCLUIDO ≡ RESUELTO
  isAgendaResuelto(estado?: string | null): boolean {
    const e = this.up(estado);
    return e === 'RESUELTO' || e === 'CONCLUIDO';
  }

  // Recuentos de Agenda
  resueltosAgenda = computed(
    () =>
      this.agenda().filter((a) => this.isAgendaResuelto(a.age_estado)).length
  );
  pendientesAgenda = computed(
    () =>
      this.agenda().filter((a) => !this.isAgendaResuelto(a.age_estado)).length
  );

  // Recuentos generales (si ya los tienes, no cambies nada más)
  totalGeneral = computed(() => this.total() + this.totalAgenda());
  resueltosGeneral = computed(() => this.resueltos() + this.resueltosAgenda());
  pendientesGeneral = computed(
    () => this.pendientes() + this.pendientesAgenda()
  );
}
