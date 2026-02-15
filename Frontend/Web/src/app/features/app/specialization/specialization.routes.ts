import { Routes } from '@angular/router';
import { SpecializationList } from './pages/specialization-list/specialization-list';
import { AddSpecialization } from './pages/add-specialization/add-specialization';

export const SPECIALIZATION_ROUTES: Routes = [
  { path: '', component: SpecializationList },
  { path: 'add', component: AddSpecialization },
];
