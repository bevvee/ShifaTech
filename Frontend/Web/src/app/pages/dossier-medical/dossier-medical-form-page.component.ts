import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { Role } from '../../core/models/role.enum';
import { Store } from '@ngrx/store';
import { selectUserRole } from '../../core/store/auth/auth.selectors';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../shared/components/form/input/input-field.component';
import { TextAreaComponent } from '../../shared/components/form/input/text-area.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { Option, SelectComponent } from '../../shared/components/form/select/select.component';
import { DossierMedicalStore } from './dossier-medical.store';
import { PatientsStore } from '../patients/patients.store';
import { VisiteStore } from '../visites/visites.store';
import { OrdonnanceStore } from '../ordonnances/ordonnances.store';
import { DossierStatus, GroupeSanguin, DossierMedicalDto } from '../../core/models/dossier-medical.model';
import { VisiteDto } from '../../core/models/visite.model';
import { OrdonnanceDto } from '../../core/models/ordonnance.model';
import { AlertService } from '../../core/services/alert.service';
import { take } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

type Mode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-dossier-medical-form-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    ButtonComponent,
    InputFieldComponent,
    TextAreaComponent,
    LabelComponent,
    SelectComponent,
  ],
  templateUrl: './dossier-medical-form-page.component.html'
})
export class DossierMedicalFormPageComponent implements OnInit {

  mode: Mode;
  submitted = false;
  readonly Role = Role;
  readonly userRole$ = inject(Store).select(selectUserRole);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(DossierMedicalStore);
  private readonly patientsStore = inject(PatientsStore);
  private readonly visitesStore = inject(VisiteStore);
  private readonly ordonnancesStore = inject(OrdonnanceStore);
  private readonly alerts = inject(AlertService);
  private readonly ngrxStore = inject(Store);

  role: Role | null = null;
  isSaving = false;

  private readonly cdr = inject(ChangeDetectorRef);
  private id: number | null;

  dossier: DossierMedicalDto | null = null;
  linkedVisites: VisiteDto[] = [];
  linkedOrdonnances: OrdonnanceDto[] = [];

  patientOptions: Option[] = [];
  groupeSanguinOptions: Option[] = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
  ];

  statusOptions: Option[] = [
    { value: 'ACTIVE', label: 'Actif' },
    { value: 'ARCHIVED', label: 'Archivé' },
    { value: 'DECEASED', label: 'Décédé' },
  ];


  form = {
    idPatient: '',
    status: 'ACTIVE' as DossierStatus,
    poids: 0,
    taille: 0,
    groupeSanguin: 'O+' as GroupeSanguin,
    antecedentsMedicaux: '',
    allergies: '',
    pathologiesChroniques: '',
    diagnostic: '',
    notes: '',
  };

  constructor() {
    this.mode = (this.route.snapshot.data['mode'] ?? 'create') as Mode;
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : null;

    const qPatientId = this.route.snapshot.queryParamMap.get('patientId');
    if (this.mode === 'create' && qPatientId) {
      this.form.idPatient = qPatientId;
    }

    this.loadPatients();
  }

  ngOnInit() {
    if (this.mode !== 'create' && this.id != null) {

      this.store.getById(this.id).subscribe({
        next: (existing) => {
          if (!existing) {
            this.router.navigate(['/dossier-medical']);
            return;
          }

          this.dossier = existing;

          this.form = {
            idPatient: String(existing.idPatient),
            status: existing.status,
            poids: existing.poids,
            taille: existing.taille,
            groupeSanguin: existing.groupeSanguin,
            antecedentsMedicaux: existing.antecedentsMedicaux,
            allergies: existing.allergies,
            pathologiesChroniques: existing.pathologiesChroniques,
            diagnostic: existing.diagnostic,
            notes: existing.notes,
          };

          this.visitesStore.getByDossierId(this.id!).subscribe(list => {
            this.linkedVisites = list;
            this.cdr.detectChanges();
          });

          this.ordonnancesStore.getByPatientId(existing.idPatient).subscribe(list => {
            this.linkedOrdonnances = list;
            this.cdr.detectChanges();
          });

          this.ngrxStore.select(selectUserRole).pipe(take(1)).subscribe(r => {
            this.role = r;
          });
        },

        error: (err) => {
          console.error(err);
          this.router.navigate(['/dossier-medical']);
        }
      });
    }
  }

  loadPatients() {
    combineLatest([
      this.patientsStore.getAll(),
      this.store.getAll()
    ]).subscribe({
      next: ([patients, dossiers]) => {
        const patientIdsWithDossier = new Set(dossiers.map(d => Number(d.idPatient)));
        const selectedId = this.form.idPatient ? Number(this.form.idPatient) : null;

        this.patientOptions = patients
          .filter(p => {
            const hasDossier = patientIdsWithDossier.has(Number(p.id));
            const isSelected = selectedId !== null && Number(p.id) === selectedId;
            // On affiche le patient s'il n'a pas de dossier OU si c'est celui déjà sélectionné (pour le mode édition/view ou redirection)
            return this.mode !== 'create' || !hasDossier || isSelected;
          })
          .map(p => ({
            value: String(p.id),
            label: `${p.nom} ${p.prenom}`
          }));
        
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur chargement données sélecteur', err)
    });
  }

  get title(): string {
    if (this.mode === 'create') return 'Nouveau Dossier Médical';
    if (this.mode === 'view') return 'Détails du Dossier Médical';
    return 'Modifier le Dossier Médical';
  }

  get isReadOnly(): boolean {
    return this.mode === 'view';
  }

  get isInfirmier(): boolean {
    return this.role === Role.INFIRMIER;
  }

  get weightError(): string {
    if (this.submitted && this.form.poids <= 0) return 'Le poids doit être supérieur à 0.';
    return '';
  }

  get heightError(): string {
    if (this.submitted && this.form.taille <= 0) return 'La taille doit être supérieure à 0.';
    return '';
  }

  get bmiDisplay(): string {
    if (this.form.poids > 0 && this.form.taille > 0) {
      const hM = this.form.taille / 100;
      return (this.form.poids / (hM * hM)).toFixed(1);
    }
    return '-';
  }

  get patientDisplayName(): string {
    return this.dossier?.nomPatient || '-';
  }

  get patientInitials(): string {
    const name = this.patientDisplayName;
    if (!name || name === '-') return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  get dossierNumber(): string {
    return this.dossier?.numDossier || '-';
  }

  get createdAtIso(): string | undefined {
    return this.dossier?.dateCreation;
  }

  getStatusPillClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-400';
      case 'DECEASED': return 'bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  createVisite() {
    if (this.id) {
      this.router.navigate(['/visites/new'], { queryParams: { dossierId: this.id } });
    }
  }

  get isValid(): boolean {
    return (
      this.form.idPatient !== '' &&
      this.form.poids > 0 &&
      this.form.taille > 0
    );
  }

  cancel() {
    this.router.navigate(['/dossier-medical']);
  }

  async save() {
    this.submitted = true;

    if (!this.isValid || this.isSaving) return;
    if (this.isReadOnly) {
      this.cancel();
      return;
    }

    this.isSaving = true;

    const payload = {
      ...this.form,
      idPatient: Number(this.form.idPatient)
    };

    try {
      if (this.mode === 'create') {
        this.store.create(payload).subscribe({
          next: async () => {
            await this.alerts.success('Dossier médical ajouté avec succès.');
            this.isSaving = false;
            this.router.navigate(['/dossier-medical']);
          },
          error: async (err) => {
            console.error(err);
            await this.alerts.error('Erreur lors de l’enregistrement.');
            this.isSaving = false;
          }
        });

      } else if (this.id != null) {
        this.store.update(this.id, payload).subscribe({
          next: async () => {
            await this.alerts.success('Dossier médical modifié avec succès.');
            this.isSaving = false;
            this.router.navigate(['/dossier-medical']);
          },
          error: async (err) => {
            console.error(err);
            await this.alerts.error('Erreur lors de l’enregistrement.');
            this.isSaving = false;
          }
        });
      }

    } catch (err) {
      console.error(err);
      await this.alerts.error('Erreur inattendue.');
      this.isSaving = false;
    }
  }

  viewVisite(id: number) {
    this.router.navigate(['/visites', id], { queryParams: { fromDossier: this.id } });
  }

  viewOrdonnance(id: number) {
    this.router.navigate(['/ordonnances', id], { queryParams: { fromDossier: this.id } });
  }
}