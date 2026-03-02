import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { Role } from '../models/role.enum';
import { JwtPayload, loadToken, logout } from '../store/auth/auth.actions';
import { selectIsAuthenticated } from '../store/auth/auth.selectors';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends ApiService {
  private router = inject(Router);
  private store = inject(Store);

  private base = environment.api.auth;
  private tokenKey = 'token';

  constructor() {
    super(inject(HttpClient));
    this.hydrateStateFromToken();
  }

  // API
  login(data: any) {
    return this.post<{ token: string }>(`${this.base}/login`, data);
  }

  register(data: any) {
    return this.post(`${this.base}/register`, data);
  }

  getProfile() {
    return this.get<any>(`${this.base}/profile`);
  }

  forgotPassword(email: string) {
    return this.get(`${this.base}/forgot-password?email=${email}`);
  }

  resetPassword(token: string, newPassword: string, confirmPassword: string) {
    return this.post(`${this.base}/reset-password?token=${token}&newPassword=${newPassword}&confirmPassword=${confirmPassword}`, {});
  }

  // TOKEN STORAGE
  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
    this.hydrateStateFromToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  clearToken() {
    localStorage.removeItem(this.tokenKey);
    this.store.dispatch(logout());
  }

  private hydrateStateFromToken() {
    const token = this.getToken();
    const payload = this.decodeToken();
    if (token && payload && this.isTokenValid(payload)) {
      this.store.dispatch(loadToken({ token, payload }));
    } else {
      this.clearToken();
    }
  }

  private isTokenValid(payload: JwtPayload): boolean {
    if (!payload?.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  }

  // AUTH STATE
  isLoggedIn() {
    return this.store.select(selectIsAuthenticated);
  }

  logout() {
    this.clearToken();
  }

  logoutAndRedirect(path = '/signin') {
    this.logout();
    this.router.navigate([path]);
  }

  decodeToken(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;

      // Convert base64url -> base64
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(json) as JwtPayload;
    } catch {
      return null;
    }
  }
}