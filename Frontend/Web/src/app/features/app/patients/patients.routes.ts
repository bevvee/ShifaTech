import { Routes } from '@angular/router';
import { PatientsList } from './pages/patients-list/patients-list';
import { AddPatient } from './pages/add-patient/add-patient';

export const PATIENTS_ROUTES: Routes = [
  { path: '', component: PatientsList },
  { path: 'add', component: AddPatient },
];
