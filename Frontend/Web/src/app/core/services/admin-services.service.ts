import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';
import { ServiceRow } from '../models/service.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminServicesService extends ApiService {
  private readonly apiBase = environment.api.admin + '/services';

  constructor() {
    super(inject(HttpClient));
  }

  /**
   * Convert backend response (idService) to frontend model (id)
   */
  private mapFromBackend(raw: any): ServiceRow {
    return {
      id: raw?.idService ?? raw?.id ?? 0,
      label: raw?.label ?? '',
      description: raw?.description ?? '',
    };
  }

  /**
   * Convert frontend model (id) to backend request (idService)
   */
  private mapToBackend(data: any) {
    return {
      label: data?.label ?? '',
      description: data?.description ?? null,
    };
  }

  /**
   * Get all services from admin database
   */
  getAllServices() {
    return this.get<any[]>(`${this.apiBase}`).pipe(
      map((items) => (items || []).map((item) => this.mapFromBackend(item)))
    );
  }

  /**
   * Get a single service by ID
   */
  getService(id: number) {
    return this.get<any>(`${this.apiBase}/${id}`).pipe(
      map((item) => this.mapFromBackend(item))
    );
  }

  /**
   * Create a new service
   */
  createService(data: Omit<ServiceRow, 'id'>) {
    const payload = this.mapToBackend(data);
    return this.post<any>(`${this.apiBase}`, payload).pipe(
      map((item) => this.mapFromBackend(item))
    );
  }

  /**
   * Update an existing service
   */
  updateService(id: number, data: Partial<Omit<ServiceRow, 'id'>>) {
    const payload = this.mapToBackend(data);
    return this.put<any>(`${this.apiBase}/${id}`, payload).pipe(
      map((item) => this.mapFromBackend(item))
    );
  }

  /**
   * Delete a service
   */
  deleteService(id: number) {
    return this.delete(`${this.apiBase}/${id}`);
  }
}
