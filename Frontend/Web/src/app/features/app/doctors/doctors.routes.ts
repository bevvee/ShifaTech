import { Routes } from '@angular/router';
import { DoctorsList } from './pages/doctors-list/doctors-list';
import { AddDoctorComponent } from './pages/add-doctor/add-doctor';
import { Specializations } from './pages/specializations/specializations';

export const DOCTORS_ROUTES: Routes = [
  { path: '', component: DoctorsList },
  { path: 'add', component: AddDoctorComponent },
  { path: 'specializations', component: Specializations },
];
