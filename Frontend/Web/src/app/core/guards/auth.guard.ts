import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../models/role.enum';

export const roleGuard = (allowedRoles: Role[]): CanActivateFn => {
  return () => {
    const router = inject(Router);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!user.roles) {
      router.navigate(['/login']);
      return false;
    }

    const hasRole = user.roles.some((r: Role) =>
      allowedRoles.includes(r)
    );

    if (!hasRole) {
      router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  };
};
