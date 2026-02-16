import { Routes } from '@angular/router';
import { OrdonnancesList } from './pages/ordonnances-list/ordonnances-list';
import { AddOrdonnance } from './pages/add-ordonnance/add-ordonnance';

export const ORDONNANCES_ROUTES: Routes = [
  { path: '', component: OrdonnancesList },
  { path: 'add', component: AddOrdonnance },
];
