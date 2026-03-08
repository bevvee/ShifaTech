import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';
import { Role } from '../models/role.enum';
import { selectUserRole } from '../store/auth/auth.selectors';

const roleDashboardMap: Record<Role, string> = {
  [Role.ADMIN]: '/admin',
  [Role.DOCTEUR]: '/docteur',
  [Role.INFIRMIER]: '/infirmier',
  [Role.PATIENT]: '/signin',
};

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const store = inject(Store);

  const allowedRoles: Role[] = route.data['roles'] ?? [];

  return store.select(selectUserRole).pipe(
    take(1),
    map((role: Role | null) => {
      if (!role) {
        return router.parseUrl('/signin');
      }

      const userRole = role.toUpperCase() as Role;
      const hasRole = allowedRoles.includes(userRole);

      if (!hasRole) {
        const redirectPath = roleDashboardMap[userRole] ?? '/signin';
        return router.parseUrl(redirectPath);
      }

      return true;
    })
  );
};

export const rootGuard: CanActivateFn = () => {
  const router = inject(Router);
  const store = inject(Store);

  return store.select(selectUserRole).pipe(
    take(1),
    map((role: Role | null) => {
      if (!role) {
        return router.parseUrl('/signin');
      }

      const userRole = role.toUpperCase() as Role;
      const redirectPath = roleDashboardMap[userRole] ?? '/signin';
      return router.parseUrl(redirectPath);
    })
  );
};
