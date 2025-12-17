import Swal, { SweetAlertIcon } from 'sweetalert2';

export class SwalStd {
  static getErrorMessage(e: any): string {
    return e?.error?.message || e?.message || 'Error';
  }

  static success(text: string, title = 'Realizado') {
    return Swal.fire(title, text, 'success');
  }

  static error(text: string, title = 'Error') {
    return Swal.fire(title, text, 'error');
  }

  static warn(text: string, title = 'Validación') {
    return Swal.fire(title, text, 'warning');
  }

  static info(text: string, title = 'Info') {
    return Swal.fire(title, text, 'info');
  }

  static async confirm(opts: {
    title: string;
    text?: string;
    confirmText?: string;
    cancelText?: string;
    icon?: SweetAlertIcon;
  }): Promise<boolean> {
    const r = await Swal.fire({
      title: opts.title,
      text: opts.text ?? '',
      icon: opts.icon ?? 'warning',
      showCancelButton: true,
      confirmButtonText: opts.confirmText ?? 'Sí',
      cancelButtonText: opts.cancelText ?? 'Cancelar',
      reverseButtons: true,
    });
    return r.isConfirmed;
  }

  // ✅ NUEVO: prompt estándar para editar horario
  static async inputHorario(opts: {
    title?: string;
    entradaDefault?: string; // "HH:MM"
    salidaDefault?: string; // "HH:MM"
    confirmText?: string;
    cancelText?: string;
  }): Promise<{ entrada: string; salida: string } | null> {
    const title = opts.title ?? 'Editar horario';
    const entDef = opts.entradaDefault ?? '08:00';
    const salDef = opts.salidaDefault ?? '17:00';

    const entId = 'swal_hora_entrada';
    const salId = 'swal_hora_salida';

    const r = await Swal.fire({
      title,
      icon: 'info',
      html: `
        <div style="text-align:left">
          <label style="display:block;margin:6px 0 4px;">Entrada</label>
          <input id="${entId}" type="time" class="swal2-input" style="width:100%;margin:0;" value="${entDef}">
          <label style="display:block;margin:10px 0 4px;">Salida</label>
          <input id="${salId}" type="time" class="swal2-input" style="width:100%;margin:0;" value="${salDef}">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: opts.confirmText ?? 'Guardar',
      cancelButtonText: opts.cancelText ?? 'Cancelar',
      reverseButtons: true,
      focusConfirm: false,
      preConfirm: () => {
        const ent = (document.getElementById(entId) as HTMLInputElement)?.value;
        const sal = (document.getElementById(salId) as HTMLInputElement)?.value;

        if (!ent || !sal) {
          Swal.showValidationMessage('Debes ingresar entrada y salida');
          return;
        }

        // Validación simple HH:MM
        const re = /^([01]\d|2[0-3]):[0-5]\d$/;
        if (!re.test(ent) || !re.test(sal)) {
          Swal.showValidationMessage('Formato inválido (HH:MM)');
          return;
        }

        // Opcional: validar que salida > entrada
        if (sal <= ent) {
          Swal.showValidationMessage(
            'La hora de salida debe ser mayor que la de entrada'
          );
          return;
        }

        return { entrada: ent, salida: sal };
      },
    });

    if (!r.isConfirmed) return null;
    return (r.value as any) ?? null;
  }
}
