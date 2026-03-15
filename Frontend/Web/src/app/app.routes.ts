import { Routes } from "@angular/router";
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FormElementsComponent } from './pages/forms/form-elements/form-elements.component';
import { BasicTablesComponent } from './pages/tables/basic-tables/basic-tables.component';
import { BlankComponent } from './pages/blank/blank.component';
import { NotFoundComponent } from './pages/other-page/not-found/not-found.component';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { InvoicesComponent } from './pages/invoices/invoices.component';
import { LineChartComponent } from './pages/charts/line-chart/line-chart.component';
import { BarChartComponent } from './pages/charts/bar-chart/bar-chart.component';
import { AlertsComponent } from './pages/ui-elements/alerts/alerts.component';
import { AvatarElementComponent } from './pages/ui-elements/avatar-element/avatar-element.component';
import { BadgesComponent } from './pages/ui-elements/badges/badges.component';
import { ButtonsComponent } from './pages/ui-elements/buttons/buttons.component';
import { ImagesComponent } from './pages/ui-elements/images/images.component';
import { VideosComponent } from './pages/ui-elements/videos/videos.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './pages/auth-pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/auth-pages/reset-password/reset-password.component';
import { CalenderComponent } from './pages/calender/calender.component';
import { RendezVousComponent } from './pages/RendezVous/RendezVous.component';
import { PatientsComponent } from './pages/patients/patients.component';
import { PatientsFormPageComponent } from './pages/patients/patients-form-page.component';
import { DocteursComponent } from './pages/docteurs/docteurs.component';
import { InfirmiersComponent } from './pages/infirmiers/infirmiers.component';
import { ServicesComponent } from './pages/services/services.component';
import { SpecialisationsComponent } from './pages/specialisations/specialisations.component';
import { DossierMedicalComponent } from './pages/dossier-medical/dossier-medical.component';
import { DossierMedicalFormPageComponent } from './pages/dossier-medical/dossier-medical-form-page.component';
import { VisitesComponent } from './pages/visites/visites.component';
import { VisitesFormPageComponent } from './pages/visites/visites-form-page.component';
import { OrdonnancesComponent } from './pages/ordonnances/ordonnances.component';
import { OrdonnancesFormPageComponent } from './pages/ordonnances/ordonnances-form-page.component';
import { roleGuard, rootGuard } from './core/guards/auth.guard';
import { Role } from './core/models/role.enum';
import { RdvEditComponent } from "./pages/RendezVous/rdv-edit.component";
import { RdvViewComponent } from "./pages/RendezVous/rdv-view.component";


export const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    canActivate: [rootGuard],
    children: [],
  },
  {
    path: "",
    component: AppLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        title: 'Dashboard | ShifaTech',
        canActivate: [roleGuard],
        data: {
          roles: [Role.ADMIN, Role.DOCTEUR, Role.INFIRMIER, Role.SECRETAIRE],
        },
      },
      {
        path: 'admin',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'docteur',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'infirmier',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: "calendar",
        component: CalenderComponent,
        title: "Calender | ShifaTech",
        canActivate: [roleGuard],
        data: { roles: [Role.DOCTEUR, Role.INFIRMIER] },
      },
      {
        path: "rendez-vous",
        component: RendezVousComponent,
        canActivate: [roleGuard],
        data: { roles: [Role.DOCTEUR, Role.INFIRMIER] },
      },
      {
        path: "rendez-vous/:id",
        component: RdvViewComponent,
        canActivate: [roleGuard],
        data: {
          mode: "view",
          roles: [Role.DOCTEUR, Role.INFIRMIER],
        },
      },
      {
        path: "rendez-vous/:id/edit",
        component: RdvEditComponent,
        canActivate: [roleGuard],
        data: {
          mode: "edit",
          roles: [Role.DOCTEUR,Role.INFIRMIER],
        },
      },
      {
        path: "rendez-vous/new",
        component: RdvEditComponent,
        canActivate: [roleGuard],
        data: {
          mode: "create",
          roles: [Role.INFIRMIER],
        },
      },
      {
        path: "docteurs",
        component: DocteursComponent,
        title: "Liste des Docteurs | ShifaTech",
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN] },
      },
      {
        path: "docteurs/new",
        component: DocteursComponent,
        title: "Ajouter un Docteur | ShifaTech",
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN] },
      },
      {
        path: "patients",
        component: PatientsComponent,
        title: "Liste des Patients | ShifaTech",
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN, Role.INFIRMIER] },
      },
      {
        path: "patients/new",
        component: PatientsFormPageComponent,
        title: "Ajouter un Patient | ShifaTech",
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN, Role.INFIRMIER] },
      },
      {
        path: "patients/:id",
        component: PatientsFormPageComponent,
        title: "Détails Patient | ShifaTech",
        canActivate: [roleGuard],
        data: {
          mode: "view",
          roles: [Role.ADMIN, Role.INFIRMIER],
        },
      },
      {
        path: "patients/:id/edit",
        component: PatientsFormPageComponent,
        title: "Modifier Patient | ShifaTech",
        canActivate: [roleGuard],
        data: {
          mode: "edit",
          roles: [Role.ADMIN, Role.INFIRMIER],
        },
      },
      // Dossier Medical
      {
        path: 'dossier-medical',
        component: DossierMedicalComponent,
        title: 'Dossiers Médicaux | ShifaTech',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN, Role.DOCTEUR, Role.INFIRMIER] }
      },
      {
        path: 'dossier-medical/new',
        component: DossierMedicalFormPageComponent,
        title: 'Nouveau Dossier | ShifaTech',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN, Role.DOCTEUR, Role.INFIRMIER] }
      },
      {
        path: 'dossier-medical/:id',
        component: DossierMedicalFormPageComponent,
        title: 'Détails Dossier | ShifaTech',
        canActivate: [roleGuard],
        data: { mode: 'view', roles: [Role.ADMIN, Role.DOCTEUR, Role.INFIRMIER] }
      },
      {
        path: 'dossier-medical/:id/edit',
        component: DossierMedicalFormPageComponent,
        title: 'Modifier Dossier | ShifaTech',
        canActivate: [roleGuard],
        data: { mode: 'edit', roles: [Role.ADMIN, Role.DOCTEUR, Role.INFIRMIER] }
      },
      // Visites
      {
        path: 'visites',
        component: VisitesComponent,
        title: 'Visites | ShifaTech',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN, Role.DOCTEUR, Role.INFIRMIER] }
      },
      {
        path: 'visites/new',
        component: VisitesFormPageComponent,
        title: 'Nouvelle Visite | ShifaTech',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN, Role.DOCTEUR, Role.INFIRMIER] }
      },
      {
        path: 'visites/:id',
        component: VisitesFormPageComponent,
        title: 'Détails Visite | ShifaTech',
        canActivate: [roleGuard],
        data: { mode: 'view', roles: [Role.ADMIN, Role.DOCTEUR, Role.INFIRMIER] }
      },
      {
        path: 'visites/:id/edit',
        component: VisitesFormPageComponent,
        title: 'Modifier Visite | ShifaTech',
        canActivate: [roleGuard],
        data: { mode: 'edit', roles: [Role.ADMIN, Role.DOCTEUR, Role.INFIRMIER] }
      },
      // Ordonnances
      {
        path: 'ordonnances',
        component: OrdonnancesComponent,
        title: 'Ordonnances | ShifaTech',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN, Role.DOCTEUR, Role.INFIRMIER] }
      },
      {
        path: 'ordonnances/new',
        component: OrdonnancesFormPageComponent,
        title: 'Nouvelle Ordonnance | ShifaTech',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN, Role.DOCTEUR, Role.INFIRMIER] }
      },
      {
        path: 'ordonnances/:id',
        component: OrdonnancesFormPageComponent,
        title: 'Détails Ordonnance | ShifaTech',
        canActivate: [roleGuard],
        data: { mode: 'view', roles: [Role.ADMIN, Role.DOCTEUR, Role.INFIRMIER] }
      },
      {
        path: 'ordonnances/:id/edit',
        component: OrdonnancesFormPageComponent,
        title: 'Modifier Ordonnance | ShifaTech',
        canActivate: [roleGuard],
        data: { mode: 'edit', roles: [Role.ADMIN, Role.DOCTEUR, Role.INFIRMIER] }
      },
      {
        path: "infirmiers",
        component: InfirmiersComponent,
        title: "Liste des Infirmiers | ShifaTech",
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN] },
      },
      {
        path: "infirmiers/new",
        component: InfirmiersComponent,
        title: "Ajouter un Infirmier | ShifaTech",
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN] },
      },
      {
        path: "services",
        component: ServicesComponent,
        title: "Liste des Services | ShifaTech",
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN] },
      },
      {
        path: "services/new",
        component: ServicesComponent,
        title: "Ajouter un Service | ShifaTech",
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN] },
      },
      {
        path: "specialisations",
        component: SpecialisationsComponent,
        title: "Liste des Spécialisations | ShifaTech",
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN] },
      },
      {
        path: "specialisations/new",
        component: SpecialisationsComponent,
        title: "Ajouter une Spécialisation | ShifaTech",
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN] },
      },
      {
        path: "profile",
        component: ProfileComponent,
        title: "Profile | ShifaTech",
      },
      {
        path: "form-elements",
        component: FormElementsComponent,
        title:
          "Angular Form Elements Dashboard | TailAdmin - Angular Admin Dashboard Template",
      },
      {
        path: "basic-tables",
        component: BasicTablesComponent,
        title:
          "Angular Basic Tables Dashboard | TailAdmin - Angular Admin Dashboard Template",
      },
      {
        path: "blank",
        component: BlankComponent,
        title:
          "Angular Blank Dashboard | TailAdmin - Angular Admin Dashboard Template",
      },
      // support tickets
      {
        path: "invoice",
        component: InvoicesComponent,
        title:
          "Angular Invoice Details Dashboard | TailAdmin - Angular Admin Dashboard Template",
      },
      {
        path: "line-chart",
        component: LineChartComponent,
        title:
          "Angular Line Chart Dashboard | TailAdmin - Angular Admin Dashboard Template",
      },
      {
        path: "bar-chart",
        component: BarChartComponent,
        title:
          "Angular Bar Chart Dashboard | TailAdmin - Angular Admin Dashboard Template",
      },
      {
        path: "alerts",
        component: AlertsComponent,
        title:
          "Angular Alerts Dashboard | TailAdmin - Angular Admin Dashboard Template",
      },
      {
        path: "avatars",
        component: AvatarElementComponent,
        title:
          "Angular Avatars Dashboard | TailAdmin - Angular Admin Dashboard Template",
      },
      {
        path: "badge",
        component: BadgesComponent,
        title:
          "Angular Badges Dashboard | TailAdmin - Angular Admin Dashboard Template",
      },
      {
        path: "buttons",
        component: ButtonsComponent,
        title:
          "Angular Buttons Dashboard | TailAdmin - Angular Admin Dashboard Template",
      },
      {
        path: "images",
        component: ImagesComponent,
        title:
          "Angular Images Dashboard | TailAdmin - Angular Admin Dashboard Template",
      },
      {
        path: "videos",
        component: VideosComponent,
        title:
          "Angular Videos Dashboard | TailAdmin - Angular Admin Dashboard Template",
      },
    ],
  },
  {
    path: "signin",
    component: SignInComponent,
    title:
      "Angular Sign In Dashboard | TailAdmin - Angular Admin Dashboard Template",
  },
  {
    path: "signup",
    component: SignUpComponent,
    title:
      "Angular Sign Up Dashboard | TailAdmin - Angular Admin Dashboard Template",
  },
  {
    path: "forgot-password",
    component: ForgotPasswordComponent,
    title: "Mot de Passe Oublié | ShifaTech",
  },
  {
    path: "reset-password",
    component: ResetPasswordComponent,
    title: "Réinitialiser Mot de Passe | ShifaTech",
  },
  {
    path: "unauthorized",
    component: NotFoundComponent,
    title: "Unauthorized | ShifaTech",
  },
  // error pages
  {
    path: "**",
    component: NotFoundComponent,
    title:
      "Angular NotFound Dashboard | TailAdmin - Angular Admin Dashboard Template",
  },
];
