import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(protected http: HttpClient) {}

  protected get<T>(url: string) {
    return this.http.get<T>(url);
  }

  protected post<T>(url: string, body: any) {
    return this.http.post<T>(url, body);
  }

  protected put<T>(url: string, body: any) {
    return this.http.put<T>(url, body);
  }

  protected patch<T>(url: string, body: any, options?: any) {
    return this.http.patch<T>(url, body, options);
  }

  protected delete<T>(url: string) {
    return this.http.delete<T>(url);
  }
}
