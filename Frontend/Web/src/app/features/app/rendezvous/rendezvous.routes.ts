import { Routes } from '@angular/router';
import { RendezvousList } from './pages/rendezvous-list/rendezvous-list';
import { AddRendezvous } from './pages/add-rendezvous/add-rendezvous';

export const RENDEZVOUS_ROUTES: Routes = [
  { path: '', component: RendezvousList },
  { path: 'add', component: AddRendezvous },
];
