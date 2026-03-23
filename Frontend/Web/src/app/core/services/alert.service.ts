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

  async confirm(options: ConfirmOptions): Promise<boolean> {
    const result = await Swal.fire({
      ...this.baseOptions(),
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
}
