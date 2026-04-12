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
    this.patientsStore.getAll().subscribe(list => {
      this.patientOptions = list.map(p => ({
        value: String(p.id),
        label: `${p.nom} ${p.prenom} (${p.numDossier})`
      }));
    });
  }

  get isReadOnly(): boolean {
    return this.mode === 'view';
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
    this.router.navigate(['/visites', id]);
  }

  viewOrdonnance(id: number) {
    this.router.navigate(['/ordonnances', id]);
  }
}