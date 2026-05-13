import { Injectable } from '@angular/core';
import { ServiceRow } from '../models/service.model';

const STORAGE_KEY = 'shifatech.services.v1';

// No hardcoded defaults — load services from persisted storage or from the server
// Services are expected to be provided by the backend and cached in localStorage by sync jobs.

@Injectable({ providedIn: 'root' })
export class ServicesCatalogService {
  getAll(): ServiceRow[] {
    if (typeof window === 'undefined') return [];

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];

      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return [];

      const normalized: ServiceRow[] = parsed
        .map((s: any) => ({
          id: Number(s?.id),
          label: String(s?.label ?? ''),
          description: String(s?.description ?? ''),
        }))
        .filter((s) => Number.isFinite(s.id) && s.id > 0 && s.label.trim().length > 0);

      return normalized;
    } catch {
      return [];
    }
  }

  saveAll(services: ServiceRow[]): void {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
    } catch {
      // ignore (storage quota, privacy mode, etc.)
    }
  }

  nextId(services: ServiceRow[]): number {
    const maxId = services.reduce((max, s) => (s.id > max ? s.id : max), 0);
    return maxId + 1;
  }

  labelFor(id: number | null | undefined): string {
    if (!id) return '';
    const services = this.getAll();
    const found = services.find((s) => s.id === id);
    return found?.label ?? `#${id}`;
  }
}
