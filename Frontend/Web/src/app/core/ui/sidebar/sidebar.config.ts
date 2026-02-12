export type SidebarRole = 'ADMIN' | 'DOCTOR' | 'NURSE';

export type SidebarChild = {
  label: string;
  route: string;
  roles?: SidebarRole[];
  icon?: string;
};

export type SidebarItem = {
  label: string;
  icon: string;
  route?: string;
  roles?: SidebarRole[];
  children?: SidebarChild[];
};

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: 'Dashboard',
    icon: 'dashboard',
    route: '/app/dashboard',
    roles: ['ADMIN', 'DOCTOR', 'NURSE'],
  },
  {
    label: 'Docteurs',
    icon: 'doctors',
    route: '/app/docteurs',
    roles: ['ADMIN'],
  },
  {
    label: 'Patients',
    icon: 'patients',
    route: '/app/patients',
    roles: ['DOCTOR', 'NURSE'],
  },
  {
    label: 'Appointments',
    icon: 'appointments',
    roles: ['NURSE', 'DOCTOR'],
    route: '/app/appointments',
  },
  {
    label: 'Services',
    icon: 'services',
    roles: ['ADMIN'],
    route: '/app/services',
  },
  {
    label: 'Specialization',
    icon: 'specialization',
    roles: ['ADMIN'],
    route: '/app/specialization',
  },
  {
    label: 'Agenda',
    icon: 'Agenda',
    roles: ['DOCTOR','NURSE'],
    route: '/app/agenda',
  },
  {
    label: 'Ordonnances',
    icon: 'ordonnances',
    roles: ['DOCTOR'],
    route: '/app/ordonnances',
  },
];
