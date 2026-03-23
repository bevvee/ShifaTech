import { Component, inject } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DropdownItemTwoComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component-two';
import { AuthService } from '../../../../core/services/auth.service';
import { Store } from '@ngrx/store';
import { selectUserProfile, selectUserRole } from '../../../../core/store/auth/auth.selectors';
import { Role } from '../../../../core/models/role.enum';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-user-dropdown',
  templateUrl: './user-dropdown.component.html',
  imports: [CommonModule, RouterModule, DropdownComponent, DropdownItemTwoComponent]
})
export class UserDropdownComponent {
  isOpen = false;
  private store = inject(Store);
  user$ = this.store.select(selectUserProfile);
  role$ = this.store.select(selectUserRole);

  nameVm$ = combineLatest([this.user$, this.role$]).pipe(
    map(([user, role]) => {
      const resolvedRole = role ?? this.normalizeRole(user?.role);
      const prefix = this.getRolePrefix(resolvedRole);
      const prefixClass = this.getRolePrefixClass(resolvedRole);
      const first = (user?.prenom ?? '').toString().trim();
      const last = (user?.nom ?? '').toString().trim();
      const full = `${first} ${last}`.trim();

      const initials = this.getInitials(first, last);
      const displayName = this.truncateWithEllipsis(full, 10);

      return {
        prefix,
        prefixClass,
        fullName: full,
        displayName,
        initials,
      };
    })
  );

  constructor(private authService: AuthService) { }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  logout() {
    this.authService.logoutAndRedirect('/signin');
    this.closeDropdown();
  }

  private getRolePrefix(role: Role | null): string {
    switch (role) {
      case Role.DOCTEUR:
        return 'Dr';
      case Role.ADMIN:
        return 'Admin';
      case Role.INFIRMIER:
        return 'Inf';
      case Role.SECRETAIRE:
        return 'Sec';
      default:
        return '';
    }
  }

  private getRolePrefixClass(role: Role | null): string {
    switch (role) {
      case Role.DOCTEUR:
        return 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400';
      case Role.ADMIN:
        return 'bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-500';
      case Role.INFIRMIER:
        return 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500';
      case Role.SECRETAIRE:
        return 'bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-500';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-300';
    }
  }

  private normalizeRole(value: unknown): Role | null {
    if (value == null) return null;
    let role = String(value).trim().toUpperCase();
    if (!role) return null;

    if (role.startsWith('ROLE_')) role = role.slice('ROLE_'.length);
    if (role === 'DOCTOR') role = Role.DOCTEUR;
    if (role === 'NURSE') role = Role.INFIRMIER;
    if (role === 'SECRETARY') role = Role.SECRETAIRE;

    if ((Object.values(Role) as string[]).includes(role)) {
      return role as Role;
    }
    return null;
  }

  private getInitials(first: string, last: string): string {
    const f = (first ?? '').trim();
    const l = (last ?? '').trim();
    const a = f ? f[0] : '';
    const b = l ? l[0] : '';
    const initials = `${a}${b}`.trim();
    if (initials) return initials.toUpperCase();
    // Fallback: take up to 2 letters from whatever is available.
    const fallback = (f || l).slice(0, 2);
    return fallback ? fallback.toUpperCase() : 'U';
  }

  private truncateWithEllipsis(value: string, maxChars: number): string {
    const s = (value ?? '').toString().trim();
    if (!s) return '';
    if (s.length <= maxChars) return s;
    return `${s.slice(0, maxChars)}...`;
  }
}