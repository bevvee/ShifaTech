import { Component, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { RdvService } from "../../core/services/rdv.service";
import { RdvCreateDto } from "../../core/models/rdv.model";
import { Router } from "@angular/router";
import { forkJoin, of, Subject } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { debounceTime, distinctUntilChanged, switchMap, take, takeUntil } from "rxjs/operators";
import { FormsModule } from "@angular/forms";
import { PageBreadcrumbComponent } from "../../shared/components/common/page-breadcrumb/page-breadcrumb.component";
import { ComponentCardComponent } from "../../shared/components/common/component-card/component-card.component";
import {
  BasicTableThreeComponent,
  RendezVousRow,
} from "../../shared/components/tables/basic-table-three/basic-table-three.component";
import { PatientApiService } from "../../core/services/api/patient-api.service";
import { PatientDto } from "../../core/models/patient.model";
import { DoctorService } from "../../core/services/doctor.service";
import { Doctor } from "../../core/models/doctor.model";
import { Store } from "@ngrx/store";
import { selectAuthUser, selectUserProfile, selectUserRole } from "../../core/store/auth/auth.selectors";
import { Role } from "../../core/models/role.enum";
import { AlertService } from "../../core/services/alert.service";
import { RdvStatut } from "../../core/models/rdv-statut.enum";

@Component({
  selector: "app-rendezvous",
  standalone: true,
  templateUrl: "./RendezVous.component.html",
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    BasicTableThreeComponent,
  ],
})
export class RendezVousComponent implements OnInit {
  rendezVous: RendezVousRow[] = [];
  loading = false;

  page = 1;
  itemsPerPage = 10;
  totalItems = 0;

  filterOpen = false;
  searchTerm: string = '';
  selectedDate: string = ''; // YYYY-MM-DD
  selectedStatut: '' | RdvStatut = '';
  selectedDoctorUserId: string = ''; // used by infirmier/secretaire
  selectedHeure: string = ''; // HH:mm (client-side filter)

  currentRole: Role | null = null;
  readonly Role = Role;
  readonly RdvStatut = RdvStatut;
  doctorsForFilter: Doctor[] = [];

  private clientFilteredAllRows: RendezVousRow[] = [];
  private readonly destroy$ = new Subject<void>();
  private readonly search$ = new Subject<string>();

  formatDate(date: string): string {
    const d = new Date(date);

    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  formatTime(time: string): string {
    const t = String(time ?? '').trim();
    if (!t) return '';

    // Common backend format: "HH:mm:ss" or "HH:mm"
    if (/^\d{2}:\d{2}/.test(t)) {
      return t.slice(0, 5);
    }

    const d = new Date(t);
    if (Number.isNaN(d.getTime())) return t;

    return d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  constructor(
    private rdvService: RdvService,
    private patientApi: PatientApiService,
    private doctorService: DoctorService,
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private alerts: AlertService,
  ) {}

  mode: "list" | "view" | "edit" | "create" = "list";
  ngOnInit() {
    const routeMode = this.route.snapshot.data["mode"];

    if (routeMode) {
      this.mode = routeMode;
    }

    if (this.mode === "list") {
      this.search$
        .pipe(
          map((v) => String(v ?? '').trim()),
          distinctUntilChanged(),
          debounceTime(250),
          takeUntil(this.destroy$)
        )
        .subscribe((term) => {
          // Keep it simple: reload (with pagination disabled when searching)
          // so results can match across all RDVs.
          if (!term) {
            this.clientFilteredAllRows = [];
            this.loadRdvs(1);
            return;
          }

          this.loadRdvs(1);
        });

      this.loadRdvs();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleFilter() {
    this.filterOpen = !this.filterOpen;
  }

  applyFilters() {
    this.loadRdvs(1);
    this.filterOpen = false;
  }

  applySearch() {
    this.loadRdvs(1);
  }

  onSearchTermChanged(value: string) {
    this.search$.next(value);
  }

  clearSearch() {
    this.searchTerm = '';
    this.clientFilteredAllRows = [];
    this.loadRdvs(1);
  }

  clearFilters() {
    this.selectedDate = '';
    this.selectedStatut = '';
    this.selectedDoctorUserId = '';
    this.selectedHeure = '';
    this.clientFilteredAllRows = [];
    this.loadRdvs(1);
  }

  loadRdvs(page: number = this.page) {
    this.loading = true;
    this.page = page;

    forkJoin({
      role: this.store.select(selectUserRole).pipe(take(1), catchError(() => of(null))),
      user: this.store.select(selectAuthUser).pipe(take(1), catchError(() => of(null))),
      profile: this.store.select(selectUserProfile).pipe(take(1), catchError(() => of(null))),
      patients: this.patientApi.getAll().pipe(catchError((err) => {
        console.error('Patients load error:', err);
        return of([] as PatientDto[]);
      })),
      doctors: this.doctorService.getDoctors().pipe(catchError((err) => {
        console.error('Doctors load error:', err);
        return of([] as Doctor[]);
      })),
    }).pipe(
      switchMap(({ role, user, profile, patients, doctors }) => {
        const isDoctor = role === Role.DOCTEUR;
        this.currentRole = role ?? null;
        this.doctorsForFilter = Array.isArray(doctors) ? doctors : [];

        const userId = this.getAuthUserId(user, profile);
        const myDoctorId = isDoctor ? this.resolveDoctorId(userId, doctors) : null;

        // rdv-service is secured and commonly stores id_docteur as the auth userId.
        // Use userId as primary filter for doctors; keep doctor-table-id as fallback only.
        const primaryDoctorIdForQuery = isDoctor ? userId : null;
        const secondaryDoctorIdForQuery = isDoctor ? myDoctorId : null;

        const baseParams: Record<string, string | number> = {
          page: this.page,
          itemsPerPage: this.itemsPerPage,
        };

        // Backend-supported filters (from your routes)
        if (this.selectedStatut) {
          baseParams['statut'] = this.selectedStatut;
        }

        if (this.selectedDate) {
          const next = this.addDays(this.selectedDate, 1);
          baseParams['date_rdv[after]'] = this.selectedDate;
          if (next) baseParams['date_rdv[before]'] = next;
        }

        // If infirmier/secretaire selects a doctor, apply it.
        // Use doctor.idUser as the primary filter value (matches rdv-service security convention).
        const selectedDoctorIdForQuery = !isDoctor && this.selectedDoctorUserId
          ? Number(this.selectedDoctorUserId)
          : null;

        const selectedDoctorSecondaryId = !isDoctor && selectedDoctorIdForQuery != null
          ? this.resolveDoctorTableIdFromSelected(selectedDoctorIdForQuery, doctors)
          : null;

        // Heure filtering is not listed in backend filters; we fetch a larger first page and cache
        // results locally for proper pagination.
        const shouldFetchAllForClientFilters = Boolean(this.selectedHeure) || Boolean(this.searchTerm?.trim());
        const fetchParams = shouldFetchAllForClientFilters
          // API Platform commonly caps itemsPerPage; pagination=false makes search reliable.
          ? { ...baseParams, pagination: false, page: 1, itemsPerPage: 1000 }
          : baseParams;

        const rdv$ = (() => {
          // Non-doctor user: optional doctor filter from dropdown
          if (!isDoctor && selectedDoctorIdForQuery != null) {
            return this.rdvService.getAll({ ...fetchParams, id_docteur: selectedDoctorIdForQuery });
          }

          // Doctor user: ALWAYS constrained to their own id (never load all RDVs)
          if (isDoctor) {
            if (primaryDoctorIdForQuery != null) {
              return this.rdvService.getAll({ ...fetchParams, id_docteur: primaryDoctorIdForQuery });
            }
            if (secondaryDoctorIdForQuery != null) {
              return this.rdvService.getAll({ ...fetchParams, id_docteur: secondaryDoctorIdForQuery });
            }
            return of([] as any);
          }

          // Infirmier/others: all RDVs (with current filters)
          return this.rdvService.getAll(fetchParams);
        })();

        return rdv$.pipe(
          map((rdvRes) => ({ rdvRes, isDoctor, secondaryDoctorIdForQuery, selectedDoctorSecondaryId, selectedDoctorIdForQuery, patients, doctors, baseParams, fetchParams })),
          catchError((err) => {
            console.error('RDV load error:', err);
            return of({ rdvRes: [] as any, isDoctor, secondaryDoctorIdForQuery, selectedDoctorSecondaryId, selectedDoctorIdForQuery, patients, doctors, baseParams, fetchParams });
          })
        );
      }),
      switchMap(({ rdvRes, isDoctor, secondaryDoctorIdForQuery, selectedDoctorSecondaryId, selectedDoctorIdForQuery, patients, doctors, baseParams, fetchParams }) => {
        const primary = this.extractRdvArray(rdvRes);

        // Fallback for doctor user (if primary ID returns nothing, try secondary ID)
        if (isDoctor && primary.length === 0 && secondaryDoctorIdForQuery != null) {
          return this.rdvService.getAll({ ...fetchParams, id_docteur: secondaryDoctorIdForQuery }).pipe(
            map((altRes) => ({ rdvRes: altRes, patients, doctors })),
            catchError((err) => {
              console.error('RDV load error (fallback):', err);
              return of({ rdvRes, patients, doctors });
            })
          );
        }

        // Fallback for infirmier/secretaire when filtering by doctor
        if (!isDoctor && selectedDoctorIdForQuery != null && primary.length === 0 && selectedDoctorSecondaryId != null) {
          return this.rdvService.getAll({ ...fetchParams, id_docteur: selectedDoctorSecondaryId }).pipe(
            map((altRes) => ({ rdvRes: altRes, patients, doctors })),
            catchError((err) => {
              console.error('RDV load error (doctor fallback):', err);
              return of({ rdvRes, patients, doctors });
            })
          );
        }

        return of({ rdvRes, patients, doctors });
      }),
      map(({ rdvRes, patients, doctors }) => {
        const rdvs = this.extractRdvArray(rdvRes);
        const totalItems = this.extractTotalItems(rdvRes, rdvs);

        const rdvsAfterHeure = this.selectedHeure
          ? rdvs.filter((r) => this.matchesHeureFilter(String((r as any).heure_debut ?? ''), this.selectedHeure))
          : rdvs;

        const patientNameByUserId = new Map<number, string>();
        const patientNameByPatientId = new Map<number, string>();
        const patientSexeById = new Map<number, string>();
        
        for (const p of patients) {
          const full = `${p.prenom ?? ''} ${p.nom ?? ''}`.trim();
          if (p.idUser != null) {
            patientNameByUserId.set(Number(p.idUser), full || `Patient ${p.idUser}`);
            patientSexeById.set(Number(p.idUser), p.sexe);
          }
          if (p.id != null) {
            patientNameByPatientId.set(Number(p.id), full || `Patient ${p.id}`);
            patientSexeById.set(Number(p.id), p.sexe);
          }
        }

        const doctorNameByUserId = new Map<number, string>();
        const doctorNameByDoctorId = new Map<number, string>();
        const doctorSexeById = new Map<number, string>();
        
        for (const d of doctors) {
          const full = `${d.prenom ?? ''} ${d.nom ?? ''}`.trim();
          if ((d as any).idUser != null) {
            doctorNameByUserId.set(Number((d as any).idUser), full || `Dr ${(d as any).idUser}`);
            doctorSexeById.set(Number((d as any).idUser), (d as any).sexe);
          }
          if ((d as any).idDocteur != null) {
            doctorNameByDoctorId.set(Number((d as any).idDocteur), full || `Dr ${(d as any).idDocteur}`);
            doctorSexeById.set(Number((d as any).idDocteur), (d as any).sexe);
          }
        }

        const rows: RendezVousRow[] = (rdvsAfterHeure as RdvCreateDto[]).map((rdv) => {
          const patientId = Number((rdv as any).id_patient);
          const doctorId = Number((rdv as any).id_docteur);

          const patientName =
            patientNameByUserId.get(patientId) ??
            patientNameByPatientId.get(patientId) ??
            `Patient ${patientId}`;

          const doctorFullName =
            doctorNameByUserId.get(doctorId) ??
            doctorNameByDoctorId.get(doctorId) ??
            `${doctorId}`;

          // Gender-based icons
          const pSexe = patientSexeById.get(patientId);
          const patientImage = pSexe === 'F' ? 'assets/img/patient-female.png' : 'assets/img/patient-male.png';
          
          const dSexe = doctorSexeById.get(doctorId);
          const medecinImage = dSexe === 'F' ? 'assets/img/user-pink.png' : 'assets/img/user-grey.png';

          return {
            id: String((rdv as any).id ?? 0),
            patient: patientName,
            patientImage,
            medecin: `Dr ${doctorFullName}`,
            medecinImage,
            date: this.formatDate((rdv as any).date_rdv),
            heure: `${this.formatTime((rdv as any).heure_debut)}H - ${this.formatTime((rdv as any).heure_fin)}H`,
            statut: this.mapStatus((rdv as any).statut ?? "EN_ATTENTE"),
          };
        });

        const search = String(this.searchTerm ?? '').trim().toLowerCase();
        const rowsAfterSearch = search ? rows.filter((r) => this.matchesSearch(r, search)) : rows;

        // If client-side filtering is applied (heure/search), cache all filtered rows and compute total from it.
        if (this.selectedHeure || search) {
          this.clientFilteredAllRows = rowsAfterSearch;
          const paged = this.slicePage(rowsAfterSearch, this.page, this.itemsPerPage);
          return { rows: paged, totalItems: rowsAfterSearch.length };
        }

        this.clientFilteredAllRows = [];
        return { rows: rowsAfterSearch, totalItems };
      })
    ).subscribe({
      next: ({ rows, totalItems }) => {
        this.rendezVous = rows;
        this.totalItems = totalItems;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  private extractRdvArray(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res['hydra:member'])) return res['hydra:member'];
    if (res && Array.isArray(res.member)) return res.member;
    if (res && Array.isArray(res.data)) return res.data;
    if (res && Array.isArray(res.items)) return res.items;
    return [];
  }

  private extractTotalItems(res: any, rdvs: any[]): number {
    if (res && typeof res === 'object') {
      const hydraTotal = (res as any)['hydra:totalItems'];
      if (hydraTotal != null && Number.isFinite(Number(hydraTotal))) return Number(hydraTotal);

      const total = (res as any).totalItems ?? (res as any).total ?? (res as any).count;
      if (total != null && Number.isFinite(Number(total))) return Number(total);
    }

    // Fallback: if API returns a plain array (non-paginated)
    return Array.isArray(rdvs) ? rdvs.length : 0;
  }

  onPageChange(page: number) {
    // When client-side filters are active, paginate locally from cached list.
    if ((this.selectedHeure || this.searchTerm?.trim()) && this.clientFilteredAllRows.length) {
      this.page = page;
      this.rendezVous = this.slicePage(this.clientFilteredAllRows, this.page, this.itemsPerPage);
      return;
    }

    this.loadRdvs(page);
  }

  onItemsPerPageChange(itemsPerPage: number) {
    this.itemsPerPage = itemsPerPage;

    if ((this.selectedHeure || this.searchTerm?.trim()) && this.clientFilteredAllRows.length) {
      this.page = 1;
      this.rendezVous = this.slicePage(this.clientFilteredAllRows, this.page, this.itemsPerPage);
      this.totalItems = this.clientFilteredAllRows.length;
      return;
    }

    this.loadRdvs(1);
  }

  private slicePage<T>(items: T[], page: number, itemsPerPage: number): T[] {
    const p = Math.max(1, Number(page) || 1);
    const size = Math.max(1, Number(itemsPerPage) || 10);
    const start = (p - 1) * size;
    return (items ?? []).slice(start, start + size);
  }

  private getAuthUserId(user: any, profile: any): number | null {
    const raw =
      profile?.idUser ??
      profile?.id_user ??
      profile?.userId ??
      profile?.id ??
      user?.idUser ??
      user?.id_user ??
      user?.userId ??
      user?.id ??
      null;
    if (raw == null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }

  private resolveDoctorId(profileUserId: number | null, doctors: Doctor[]): number | null {
    if (profileUserId == null) return null;
    const match = doctors.find((d) => Number((d as any).idUser) === Number(profileUserId));
    return (match as any)?.idDocteur != null ? Number((match as any).idDocteur) : null;
  }

  private resolveDoctorTableIdFromSelected(selectedDoctorUserId: number, doctors: Doctor[]): number | null {
    const match = (doctors ?? []).find((d) => Number((d as any).idUser) === Number(selectedDoctorUserId));
    return (match as any)?.idDocteur != null ? Number((match as any).idDocteur) : null;
  }

  private addDays(dateKey: string, days: number): string | null {
    const raw = String(dateKey ?? '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
    const d = new Date(`${raw}T00:00:00`);
    if (isNaN(d.getTime())) return null;
    d.setDate(d.getDate() + Number(days));
    return d.toISOString().slice(0, 10);
  }

  private matchesHeureFilter(heureDebut: string, selectedHeure: string): boolean {
    const h = String(heureDebut ?? '').trim();
    const target = String(selectedHeure ?? '').trim();
    if (!target) return true;
    // Accept "HH:mm:ss" or "HH:mm" from backend
    const hhmm = /^\d{2}:\d{2}/.test(h) ? h.slice(0, 5) : h;
    return hhmm === target;
  }

  private matchesSearch(row: RendezVousRow, termLower: string): boolean {
    const hay = `${row.patient} ${row.medecin} ${row.date} ${row.heure} ${row.statut}`.toLowerCase();
    return hay.includes(termLower);
  }

  mapStatus(status: RdvStatut | string): "Confirmé" | "En attente" | "Annulé" | "Terminé" {
    const s = String(status ?? "").trim().toUpperCase();

    if (s === RdvStatut.CONFIRME) {
      return "Confirmé";
    }

    if (s === RdvStatut.ANNULE) {
      return "Annulé";
    }

    if (s === RdvStatut.TERMINE) {
      return "Terminé";
    }

    return "En attente";
  }

  viewRdv(rdv: any) {
    this.router.navigate(["/rendez-vous", rdv.id]);
  }

  editRdv(rdv: any) {
    this.router.navigate(["/rendez-vous", rdv.id, "edit"]);
  }

  deleteRdv(rdv: any) {
    void this.confirmAndDeleteRdv(rdv);

  }

  private async confirmAndDeleteRdv(rdv: any) {
    const ok = await this.alerts.confirmDelete('ce rendez-vous');
    if (!ok) return;

    this.rdvService.deleteById(rdv.id).subscribe({
      next: () => this.loadRdvs(),

      error: (err) => console.error(err),
    });
  }
}
