import { Routes } from '@angular/router';
import { ServicesList } from './pages/services-list/services-list';
import { AddService } from './pages/add-service/add-service';

export const SERVICES_ROUTES: Routes = [
  { path: '', component: ServicesList },
  { path: 'add', component: AddService },
];
