import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { Role } from '../models/role.enum';

type JwtPayload = {
  sub?: string | number;
  id?: string | number;
  userId?: string | number;

  role?: Role | string;
  roles?: Array<Role | string>;

  exp?: number;
  iat?: number;

  [key: string]: any;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService extends ApiService {
  private router = inject(Router);

  private base = environment.api.auth;
  private tokenKey = 'token';

  // API
  login(data: any) {
    return this.post<{ token: string }>(`${this.base}/login`, data);
  }

  register(data: any) {
    return this.post(`${this.base}/register`, data);
  }

  // TOKEN STORAGE
  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  clearToken() {
    localStorage.removeItem(this.tokenKey);
  }

  // AUTH STATE
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const payload = this.decodeToken();
    if (!payload?.exp) return true; // if exp missing, treat as valid (or change to false)

    // exp is in seconds
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  }

  logout() {
    this.clearToken();
  }

  logoutAndRedirect(path = '/signin') {
    this.logout();
    this.router.navigate([path]);
  }

  // USER INFO FROM JWT
  getUserRole(): Role | null {
    const payload = this.decodeToken();
    if (!payload) return null;

    // Case 1: payload.role = "ADMIN"
    if (payload.role) return payload.role as Role;

    // Case 2: payload.roles = ["ADMIN"]
    if (Array.isArray(payload.roles) && payload.roles.length > 0) {
      return payload.roles[0] as Role;
    }

    return null;
  }

  getUserId(): number | null {
    const payload = this.decodeToken();
    if (!payload) return null;

    const raw =
      payload.sub ??
      payload.id ??
      payload.userId;

    if (raw === undefined || raw === null) return null;

    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
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