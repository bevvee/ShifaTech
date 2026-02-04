import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './core/layouts/public-layout/public-layout';
import { AppLayoutComponent } from './core/layouts/app-layout/app-layout';

export const routes: Routes = [
  // Public website
  {
    path: '',
    component: PublicLayoutComponent,
    loadChildren: () =>
      import('./features/public/public.routes').then(m => m.PUBLIC_ROUTES),
  },

  // Auth pages
  {
    path: '',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },

  // Management app (protected later with guard)
  {
    path: 'app',
    component: AppLayoutComponent,
    loadChildren: () =>
      import('./features/app/app.routes').then(m => m.APP_ROUTES),
  },

  { path: '**', redirectTo: '' },
];
