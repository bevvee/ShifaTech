import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, of, forkJoin } from 'rxjs';
import { catchError, map, take, switchMap } from 'rxjs/operators';
import { Doctor } from '../../../../core/models/doctor.model';
import { SafeHtmlPipe } from '../../../pipe/safe-html.pipe';
import { Role } from '../../../../core/models/role.enum';
import { selectAuthUser, selectUserProfile, selectUserRole } from '../../../../core/store/auth/auth.selectors';
import { DoctorService } from '../../../../core/services/doctor.service';
import { RdvService } from '../../../../core/services/rdv.service';
import { SpecialityService } from '../../../../core/services/speciality.service';
import { PatientApiService } from '../../../../core/services/api/patient-api.service';
import { VisiteStore } from '../../../../pages/visites/visites.store';
import { InfirmierService } from '../../../../core/services/infirmier.service';
import { SecretaireService } from '../../../../core/services/secretaire.service';

@Component({
  selector: 'app-ecommerce-metrics',
  standalone: true,
  imports: [CommonModule, SafeHtmlPipe],
  templateUrl: './ecommerce-metrics.component.html'
})
export class EcommerceMetricsComponent implements OnInit, OnDestroy {

  private readonly store = inject(Store);
  private readonly doctorService = inject(DoctorService);
  private readonly rdvService = inject(RdvService);
  private readonly specialityService = inject(SpecialityService);
  private readonly patientApi = inject(PatientApiService);
  private readonly visiteStore = inject(VisiteStore);
  private readonly infirmierService = inject(InfirmierService);
  private readonly secretaireService = inject(SecretaireService);


  private readonly subscription = new Subscription();
  private doctorRdvMetricsUserId: number | null = null;

  role: Role | null = null;
  today = new Date();

  metrics: Array<{
    key: string;
    label: string;
    value: number;
    icon: string;
  }> = [];

  public icons = {
    groupIcon:`<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-6"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.80443 5.60156C7.59109 5.60156 6.60749 6.58517 6.60749 7.79851C6.60749 9.01185 7.59109 9.99545 8.80443 9.99545C10.0178 9.99545 11.0014 9.01185 11.0014 7.79851C11.0014 6.58517 10.0178 5.60156 8.80443 5.60156ZM5.10749 7.79851C5.10749 5.75674 6.76267 4.10156 8.80443 4.10156C10.8462 4.10156 12.5014 5.75674 12.5014 7.79851C12.5014 9.84027 10.8462 11.4955 8.80443 11.4955C6.76267 11.4955 5.10749 9.84027 5.10749 7.79851ZM4.86252 15.3208C4.08769 16.0881 3.70377 17.0608 3.51705 17.8611C3.48384 18.0034 3.5211 18.1175 3.60712 18.2112C3.70161 18.3141 3.86659 18.3987 4.07591 18.3987H13.4249C13.6343 18.3987 13.7992 18.3141 13.8937 18.2112C13.9797 18.1175 14.017 18.0034 13.9838 17.8611C13.7971 17.0608 13.4132 16.0881 12.6383 15.3208C11.8821 14.572 10.6899 13.955 8.75042 13.955C6.81096 13.955 5.61877 14.572 4.86252 15.3208ZM3.8071 14.2549C4.87163 13.2009 6.45602 12.455 8.75042 12.455C11.0448 12.455 12.6292 13.2009 13.6937 14.2549C14.7397 15.2906 15.2207 16.5607 15.4446 17.5202C15.7658 18.8971 14.6071 19.8987 13.4249 19.8987H4.07591C2.89369 19.8987 1.73504 18.8971 2.05628 17.5202C2.28015 16.5607 2.76117 15.2906 3.8071 14.2549ZM15.3042 11.4955C14.4702 11.4955 13.7006 11.2193 13.0821 10.7533C13.3742 10.3314 13.6054 9.86419 13.7632 9.36432C14.1597 9.75463 14.7039 9.99545 15.3042 9.99545C16.5176 9.99545 17.5012 9.01185 17.5012 7.79851C17.5012 6.58517 16.5176 5.60156 15.3042 5.60156C14.7039 5.60156 14.1597 5.84239 13.7632 6.23271C13.6054 5.73284 13.3741 5.26561 13.082 4.84371C13.7006 4.37777 14.4702 4.10156 15.3042 4.10156C17.346 4.10156 19.0012 5.75674 19.0012 7.79851C19.0012 9.84027 17.346 11.4955 15.3042 11.4955ZM19.9248 19.8987H16.3901C16.7014 19.4736 16.9159 18.969 16.9827 18.3987H19.9248C20.1341 18.3987 20.2991 18.3141 20.3936 18.2112C20.4796 18.1175 20.5169 18.0034 20.4837 17.861C20.2969 17.0607 19.913 16.088 19.1382 15.3208C18.4047 14.5945 17.261 13.9921 15.4231 13.9566C15.2232 13.6945 14.9995 13.437 14.7491 13.1891C14.5144 12.9566 14.262 12.7384 13.9916 12.5362C14.3853 12.4831 14.8044 12.4549 15.2503 12.4549C17.5447 12.4549 19.1291 13.2008 20.1936 14.2549C21.2395 15.2906 21.7206 16.5607 21.9444 17.5202C22.2657 18.8971 21.107 19.8987 19.9248 19.8987Z" fill="currentColor"></path></svg>`,
    arrowUpIcon:`<svg class="fill-current" width="1em" height="1em" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.06462 1.62393C6.20193 1.47072 6.40135 1.37432 6.62329 1.37432C6.6236 1.37432 6.62391 1.37432 6.62422 1.37432C6.81631 1.37415 7.00845 1.44731 7.15505 1.5938L10.1551 4.5918C10.4481 4.88459 10.4483 5.35946 10.1555 5.65246C9.86273 5.94546 9.38785 5.94562 9.09486 5.65283L7.37329 3.93247L7.37329 10.125C7.37329 10.5392 7.03751 10.875 6.62329 10.875C6.20908 10.875 5.87329 10.5392 5.87329 10.125L5.87329 3.93578L4.15516 5.65281C3.86218 5.94561 3.3873 5.94546 3.0945 5.65248C2.8017 5.35949 2.80185 4.88462 3.09484 4.59182L6.06462 1.62393Z" fill=""></path></svg>`,
    boxIconLine:`<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-6"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.665 3.75621C11.8762 3.65064 12.1247 3.65064 12.3358 3.75621L18.7807 6.97856L12.3358 10.2009C12.1247 10.3065 11.8762 10.3065 11.665 10.2009L5.22014 6.97856L11.665 3.75621ZM4.29297 8.19203V16.0946C4.29297 16.3787 4.45347 16.6384 4.70757 16.7654L11.25 20.0366V11.6513C11.1631 11.6205 11.0777 11.5843 10.9942 11.5426L4.29297 8.19203ZM12.75 20.037L19.2933 16.7654C19.5474 16.6384 19.7079 16.3787 19.7079 16.0946V8.19202L13.0066 11.5426C12.9229 11.5844 12.8372 11.6208 12.75 11.6516V20.037ZM13.0066 2.41456C12.3732 2.09786 11.6277 2.09786 10.9942 2.41456L4.03676 5.89319C3.27449 6.27432 2.79297 7.05342 2.79297 7.90566V16.0946C2.79297 16.9469 3.27448 17.726 4.03676 18.1071L10.9942 21.5857L11.3296 20.9149L10.9942 21.5857C11.6277 21.9024 12.3732 21.9024 13.0066 21.5857L19.9641 18.1071C20.7264 17.726 21.2079 16.9469 21.2079 16.0946V7.90566C21.2079 7.05342 20.7264 6.27432 19.9641 5.89319L13.0066 2.41456Z" fill="currentColor"></path></svg>`,
    arrowDownIcon:`<svg class="fill-current" width="1em" height="1em" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.31462 10.3761C5.45194 10.5293 5.65136 10.6257 5.87329 10.6257C5.8736 10.6257 5.8739 10.6257 5.87421 10.6257C6.0663 10.6259 6.25845 10.5527 6.40505 10.4062L9.40514 7.4082C9.69814 7.11541 9.69831 6.64054 9.40552 6.34754C9.11273 6.05454 8.63785 6.05438 8.34486 6.34717L6.62329 8.06753L6.62329 1.875C6.62329 1.46079 6.28751 1.125 5.87329 1.125C5.45908 1.125 5.12329 1.46079 5.12329 1.875L5.12329 8.06422L3.40516 6.34719C3.11218 6.05439 2.6373 6.05454 2.3445 6.34752C2.0517 6.64051 2.05185 7.11538 2.34484 7.40818L5.31462 10.3761Z" fill=""></path></svg>`
  }

  getMetricColorClasses(key: string): string {
    switch (key) {
      case 'doctors':
      case 'patients':
        return 'bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-500';

      case 'infirmiers':
      case 'secretaires':
      case 'visites':
        return 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500';

      case 'services':
      case 'rdv':
        return 'bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-500';

      case 'specialisations':
        return 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500';
      
      case 'rdv_today':
        return 'bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-500';

      case 'rdv_attente':
        return 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500';

      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-white/90';
    }
  }

  getMetricValue(key: string): number {
    return this.metrics.find(m => m.key === key)?.value ?? 0;
  }

  ngOnInit(): void {
    this.subscription.add(
      this.store.select(selectUserRole).subscribe((role) => {
        this.role = role ? (role.toUpperCase() as Role) : null;
        this.loadMetrics();
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadMetrics(): void {
    if (this.role === Role.ADMIN) {
      this.loadAdminMetrics();
      return;
    }

    if (this.role === Role.DOCTEUR) {
      this.loadDoctorMetrics();
      return;
    }

    if (this.role === Role.INFIRMIER) {
      this.loadInfirmierMetrics();
      return;
    }

    if (this.role === Role.SECRETAIRE) {
      this.loadSecretaireMetrics();
      return;
    }

    this.metrics = [];
  }

  private loadAdminMetrics(): void {
    this.metrics = [
      {
        key: 'doctors',
        label: 'Total Docteurs',
        value: 0,
        icon: this.icons.groupIcon,
      },
      {
        key: 'infirmiers',
        label: 'Total Infirmiers',
        value: 0,
        icon: this.icons.groupIcon,
      },
      {
        key: 'secretaires',
        label: 'Total Secretaire',
        value: 0,
        icon: this.icons.groupIcon,
      },
      {
        key: 'specialisations',
        label: 'Total Spécialisations',
        value: 0,
        icon: this.icons.boxIconLine,
      },
    ];

    this.doctorService
      .getDoctors()
      .pipe(
        map((rows) => (Array.isArray(rows) ? rows.length : 0)),
        catchError(() => of(0)),
      )
      .subscribe((count) => this.setMetricValue('doctors', count));

    this.infirmierService
      .getAll()
      .pipe(
        map((res) => this.countFromResponse(res)),
        catchError(() => of(0)),
      )
      .subscribe((count) => this.setMetricValue('infirmiers', count));

    this.secretaireService
      .getAll()
      .pipe(
        map((res) => this.countFromResponse(res)),
        catchError(() => of(0)),
      )
      .subscribe((count) => this.setMetricValue('secretaires', count));

    this.specialityService
      .getSpecialities()
      .pipe(
        map((rows) => (Array.isArray(rows) ? rows.length : 0)),
        catchError(() => of(0)),
      )
      .subscribe((count) => this.setMetricValue('specialisations', count));
  }

  private loadDoctorMetrics(): void {
    this.metrics = [
      {
        key: 'rdv',
        label: 'Total RDV',
        value: 0,
        icon: this.icons.boxIconLine,
      },
      {
        key: 'patients',
        label: 'Patients (RDV terminé)',
        value: 0,
        icon: this.icons.groupIcon,
      },
    ];

    this.subscription.add(
      this.doctorService.getDoctors().pipe(
        switchMap((doctors: Doctor[]) => {
          return forkJoin({
            profile: this.store.select(selectUserProfile).pipe(take(1), catchError(() => of(null))),
            user: this.store.select(selectAuthUser).pipe(take(1), catchError(() => of(null)))
          }).pipe(
            map(({ profile, user }) => {
              const rawUserId = (profile as any)?.idUser ?? (profile as any)?.id_user ?? (profile as any)?.userId ?? (profile as any)?.id ??
                                (user as any)?.idUser ?? (user as any)?.id_user ?? (user as any)?.userId ?? (user as any)?.id ?? null;
              const userId = rawUserId != null ? Number(rawUserId) : null;
              const match = doctors.find(d => Number(d.idUser) === Number(userId));
              return (match?.idDocteur ?? userId) as number | null;
            })
          );
        })
      ).subscribe((id: number | null) => {
        if (id) this.loadDoctorRdvMetrics(id);
      })
    );
  }

  private loadDoctorRdvMetrics(doctorId: number): void {
    if (!doctorId || Number.isNaN(doctorId)) return;
    if (this.doctorRdvMetricsUserId === doctorId) return;
    this.doctorRdvMetricsUserId = doctorId;

    // Use proxy from doctor-service
    this.doctorService.getMyAppointments()
      .pipe(
        map((res: any) => this.extractArrayFromResponse(res.data || res)),
        catchError(() => of([] as any[])),
      )
      .subscribe((items: any[]) => {
        this.setMetricValue('rdv', items.length);

        const finishedPatientIds = new Set<number>();
        for (const it of items) {
          const status = String(it?.statut ?? it?.status ?? '').trim().toUpperCase();
          const isFinished = status === 'TERMINE' || status === 'TERMINÉ' || status === 'FINISHED';
          if (!isFinished) continue;

          const pidRaw = it?.idPatient ?? it?.id_patient ?? it?.patientId;
          const pid = pidRaw != null ? Number(pidRaw) : NaN;
          if (!Number.isNaN(pid)) finishedPatientIds.add(pid);
        }

        this.setMetricValue('patients', finishedPatientIds.size);
      });
  }

  private extractArrayFromResponse(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res['hydra:member'])) return res['hydra:member'];
    if (res && Array.isArray(res.member)) return res.member;
    if (res && Array.isArray(res.data)) return res.data;
    if (res && Array.isArray(res.items)) return res.items;
    return [];
  }

  private loadSecretaireMetrics(): void {
    this.metrics = [
      {
        key: 'patients',
        label: 'Total Patients',
        value: 0,
        icon: this.icons.groupIcon,
      },
      {
        key: 'rdv',
        label: 'Total RDV',
        value: 0,
        icon: this.icons.boxIconLine,
      },
      {
        key: 'visites',
        label: 'Total Visites',
        value: 0,
        icon: this.icons.boxIconLine,
      },
    ];

    this.subscription.add(
      this.visiteStore
        .getAll()
        .pipe(
          map((rows) => (Array.isArray(rows) ? rows.length : 0)),
          catchError(() => of(0)),
        )
        .subscribe((count) => this.setMetricValue('visites', count)),
    );

    this.patientApi
      .getAll()
      .pipe(
        map((rows) => (Array.isArray(rows) ? rows.length : 0)),
        catchError(() => of(0)),
      )
      .subscribe((count) => this.setMetricValue('patients', count));

    this.rdvService
      .getAll()
      .pipe(
        map((res) => this.countFromResponse(res)),
        catchError(() => of(0)),
      )
      .subscribe((count) => this.setMetricValue('rdv', count));
  }

  private loadInfirmierMetrics(): void {
    const today = new Date().toISOString().slice(0, 10);

    this.metrics = [
      {
        key: 'patients',
        label: 'Total Patients',
        value: 0,
        icon: this.icons.groupIcon,
      },
      {
        key: 'rdv_today',
        label: "RDV Aujourd'hui",
        value: 0,
        icon: this.icons.boxIconLine,
      },
      {
        key: 'rdv_attente',
        label: 'RDV En Attente',
        value: 0,
        icon: this.icons.boxIconLine,
      },
      {
        key: 'visites',
        label: 'Visites Ce Mois',
        value: 0,
        icon: this.icons.boxIconLine,
      },
    ];

    // Total patients
    this.patientApi
      .getAll()
      .pipe(
        map((rows) => (Array.isArray(rows) ? rows.length : 0)),
        catchError(() => of(0)),
      )
      .subscribe((count) => this.setMetricValue('patients', count));

    // RDV aujourd'hui
    this.rdvService
      .getAll({
        'date_rdv[after]': today,
        'date_rdv[before]': today,
      })
      .pipe(
        map((res) => this.countFromResponse(res)),
        catchError(() => of(0)),
      )
      .subscribe((count) => this.setMetricValue('rdv_today', count));

    // RDV en attente aujourd'hui
    this.rdvService
      .getAll({
        'date_rdv[after]': today,
        'date_rdv[before]': today,
        statut: 'EN_ATTENTE',
      })
      .pipe(
        map((res) => this.countFromResponse(res)),
        catchError(() => of(0)),
      )
      .subscribe((count) => this.setMetricValue('rdv_attente', count));

    // Visites ce mois
    const firstDay = new Date();
    firstDay.setDate(1);
    const firstDayStr = firstDay.toISOString().slice(0, 10);

    this.subscription.add(
      this.visiteStore
        .getAll()
        .pipe(
          map((rows) => {
            if (!Array.isArray(rows)) return 0;
            return rows.filter((v: any) => {
              const d = v.dateVisite ?? v.date_visite ?? v.createdAt ?? v.created_at;
              return d && d >= firstDayStr;
            }).length;
          }),
          catchError(() => of(0)),
        )
        .subscribe((count) => this.setMetricValue('visites', count)),
    );
  }

  private setMetricValue(key: string, value: number): void {
    this.metrics = this.metrics.map((m) => (m.key === key ? { ...m, value } : m));
  }

  private countFromResponse(res: any): number {
    if (res && typeof res['totalItems'] === 'number') return res['totalItems'];
    // API Platform (Hydra)
    if (res && typeof res['hydra:totalItems'] === 'number') return res['hydra:totalItems'];
    if (res && Array.isArray(res['hydra:member'])) return res['hydra:member'].length;
    if (res && Array.isArray(res.member)) return res.member.length;
    if (Array.isArray(res)) return res.length;
    if (res && Array.isArray(res.data)) return res.data.length;
    if (res && Array.isArray(res.items)) return res.items.length;
    return 0;
  }
}
