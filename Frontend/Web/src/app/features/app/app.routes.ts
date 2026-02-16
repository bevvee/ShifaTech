import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

  {
    path: 'dashboard',
    loadChildren: () => import('./admin/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
  },

  {
    path: 'doctors',
    loadChildren: () => import('./doctors/doctors.routes').then(m => m.DOCTORS_ROUTES),
  },
  {
  path: 'patients',
  loadChildren: () =>
    import('./patients/patients.routes').then(m => m.PATIENTS_ROUTES)
},
{
  path: 'infirmiers',
  loadChildren: () =>
    import('./infirmiers/infirmiers.routes').then(m => m.INFIRMIERS_ROUTES)
},
{
  path: 'rendezvous',
  loadChildren: () =>
    import('./rendezvous/rendezvous.routes').then(m => m.RENDEZVOUS_ROUTES)
},
{
  path: 'services',
  loadChildren: () =>
    import('./services/services.routes').then(m => m.SERVICES_ROUTES)
},
{
  path: 'specialization',
  loadChildren: () =>
    import('./specialization/specialization.routes').then(m => m.SPECIALIZATION_ROUTES)
},
{
  path: 'agenda',
  loadChildren: () =>
    import('./agenda/agenda.routes').then(m => m.AGENDA_ROUTES)
},
{
  path: 'ordonnances',
  loadChildren: () =>
    import('./ordonnances/ordonnances.routes').then(m => m.ORDONNANCES_ROUTES)
},
];
