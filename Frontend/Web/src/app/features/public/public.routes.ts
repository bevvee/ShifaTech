import { Routes } from '@angular/router';
import { LoginComponent } from '../auth/pages/login/login';

export const PUBLIC_ROUTES: Routes = [
  { path: '', component: LoginComponent },
  // { path: 'contact', component: ContactComponent },
];
