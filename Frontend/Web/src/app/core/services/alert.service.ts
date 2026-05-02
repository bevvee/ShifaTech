import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

export type ConfirmOptions = {
  title: string;
  text?: string;
  icon?: SweetAlertIcon;
  confirmText?: string;
  cancelText?: string;
};

@Injectable({ providedIn: 'root' })
export class AlertService {
  private baseOptions() {
    return {
      width: 'min(36rem, calc(100vw - 1rem))',
      padding: '1.25rem',
      customClass: {
        container: 'swal-shifa-container',
        popup: 'swal-shifa-popup',
        title: 'swal-shifa-title',
        htmlContainer: 'swal-shifa-text',
        actions: 'swal-shifa-actions',
        confirmButton: 'swal-shifa-confirm',
        cancelButton: 'swal-shifa-cancel',
      },
      buttonsStyling: false,
    } as const;
  }

  private toastOptions() {
    return {
      toast: true,
      position: 'top-end' as const,
      width: 'min(24rem, calc(100vw - 1rem))',
      padding: '0.95rem 1rem',
      showConfirmButton: false,
      timer: 3200,
      timerProgressBar: true,
      customClass: {
        container: 'swal-shifa-container',
        popup: 'swal-shifa-toast',
        title: 'swal-shifa-toast-title',
        htmlContainer: 'swal-shifa-toast-text',
      },
    } as const;
  }

  async confirm(options: ConfirmOptions): Promise<boolean> {
    const base = this.baseOptions();

    const result = await Swal.fire({
      ...base,
      customClass: {
        ...base.customClass,
        container: 'swal-shifa-container swal-shifa-confirm-container',
      },
      title: options.title,
      text: options.text,
      icon: options.icon ?? 'question',
      showCancelButton: true,
      confirmButtonText: options.confirmText ?? 'Confirmer',
      cancelButtonText: options.cancelText ?? 'Annuler',
      reverseButtons: true,
      focusCancel: true,
    });

    return result.isConfirmed;
  }

  confirmDelete(what: string = 'cet élément'): Promise<boolean> {
    return this.confirm({
      title: 'Supprimer ?',
      text: `Voulez-vous vraiment supprimer ${what} ?`,
      icon: 'warning',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
    });
  }

  async success(text: string, title: string = 'Succès'): Promise<void> {
    await Swal.fire({
      ...this.baseOptions(),
      title,
      text,
      icon: 'success',
      confirmButtonText: 'OK',
    });
  }

  async error(text: string, title: string = 'Erreur'): Promise<void> {
    await Swal.fire({
      ...this.baseOptions(),
      title,
      text,
      icon: 'error',
      confirmButtonText: 'OK',
    });
  }

  async info(text: string, title: string = 'Information'): Promise<void> {
    await Swal.fire({
      ...this.baseOptions(),
      title,
      text,
      icon: 'info',
      confirmButtonText: 'OK',
    });
  }

  async toast(icon: SweetAlertIcon, title: string, text: string): Promise<void> {
    const result = await Swal.fire({
      ...this.toastOptions(),
      icon,
      title,
      text,
      background: undefined,
      didOpen: (toast: any) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    void result;
  }
}
