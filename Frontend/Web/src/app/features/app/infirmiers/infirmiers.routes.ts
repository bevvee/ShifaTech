import { Routes } from '@angular/router';
import { InfirmiersList } from './pages/infirmiers-list/infirmiers-list';
import { AddInfirmier } from './pages/add-infirmier/add-infirmier';

export const INFIRMIERS_ROUTES: Routes = [
  { path: '', component: InfirmiersList },
  { path: 'add', component: AddInfirmier },
];
