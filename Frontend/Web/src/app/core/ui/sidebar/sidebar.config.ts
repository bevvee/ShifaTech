import { UserRole } from '../../../shared/models/role.model';


export interface SidebarChild {
  label: string;
  route: string;
  roles?: UserRole[];
  icon?: string;
}

export interface SidebarItem {
  label: string;
  icon: string;
  route?: string;
  roles?: UserRole[];
  children?: SidebarChild[];
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: 'Dashboard',
    icon: 'dashboard',
    route: '/app/dashboard',
    roles: [UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE],
  },
  {
    label: 'Docteurs',
    icon: 'doctors',
    route: '/app/doctors',
    roles: [UserRole.ADMIN],
  },
  {
    label: 'Infirmiers',
    icon: 'infirmier',
    route: '/app/infirmiers',
    roles: [UserRole.ADMIN],
  },
  {
    label: 'Patients',
    icon: 'patients',
    route: '/app/patients',
    roles: [UserRole.DOCTOR, UserRole.NURSE],
  },
  {
    label: 'Rendez-Vous',
    icon: 'rendezvous',
    roles: [UserRole.DOCTOR, UserRole.NURSE],
    children: [
    { label: 'Agenda', route: '/app/agenda' },
    { label: 'Rendez Vous', route: '/app/rendezvous' },
  ]
  },
  {
    label: 'Services',
    icon: 'services',
    route: '/app/services',
    roles: [UserRole.ADMIN],
  },
  {
    label: 'Specializations',
    icon: 'specialization',
    route: '/app/specialization',
    roles: [UserRole.ADMIN],
  },
/*   {
    label: 'Agenda',
    icon: 'agenda',
    route: '/app/agenda',
    roles: [UserRole.DOCTOR, UserRole.NURSE],
  }, */
  {
    label: 'Ordonnances',
    icon: 'ordonnances',
    route: '/app/ordonnances',
    roles: [UserRole.DOCTOR, UserRole.NURSE],
  },
];
