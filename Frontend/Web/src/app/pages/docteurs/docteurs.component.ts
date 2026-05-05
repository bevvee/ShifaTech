import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ListCardComponent } from '../../shared/components/common/list-card/list-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { BadgeComponent } from '../../shared/components/ui/badge/badge.component';
import { DoctorService } from '../../core/services/doctor.service';
import { Doctor } from '../../core/models/doctor.model';
import { Sexe } from '../../core/models/sexe.enum';
import { AlertService } from '../../core/services/alert.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-docteurs',
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ListCardComponent,
    ButtonComponent,
    BadgeComponent,
  ],
  templateUrl: './docteurs.component.html',
  styles: ``
})
export class DocteursComponent implements OnInit, OnDestroy {

  private readonly subscription = new Subscription();

  docteurs: Doctor[] = [];
  loading = true;

  constructor(
    private readonly router: Router,
    private readonly doctorService: DoctorService,
    private readonly alerts: AlertService,
  ) { }

  ngOnInit() {
    this.loadDoctors();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadDoctors() {
    this.loading = true;
    this.subscription.add(
      this.doctorService.getDoctors().subscribe({
        next: (data) => {
          this.docteurs = data;
          this.filteredDocteurs = data;
        },
        error: (err: any) => console.error('Error loading doctors', err),
        complete: () => this.loading = false,
      }),
    );
  }

  searchTerm = '';
  filteredDocteurs: Doctor[] = [];

  onSearch() {
    const q = this.searchTerm.toLowerCase().trim();
    if (!q) {
      this.filteredDocteurs = this.docteurs;
    } else {
      this.filteredDocteurs = this.docteurs.filter(d =>
        (d.nom?.toLowerCase().includes(q)) ||
        (d.prenom?.toLowerCase().includes(q)) ||
        (d.numeroOrdre?.toLowerCase().includes(q)) ||
        (d.specialiteLabel?.toLowerCase().includes(q))
      );
    }
  }

  goToCreate() {
    this.router.navigate(['/docteurs/new']);
  }

  goToView(row: Doctor) {
    this.router.navigate(['/docteurs', row.idDocteur]);
  }

  goToEdit(row: Doctor) {
    this.router.navigate(['/docteurs', row.idDocteur, 'edit']);
  }

  deleteDoctor(id: number) {
    void this.confirmAndDeleteDoctor(id);
  }

  /** Silhouette selon le sexe (fichiers dans `public/assets/img/`). */
  avatarUrl(d: Doctor): string {
    const s = String(d.sexe ?? '').toUpperCase();
    // API / enum : F = féminin ; M, H ou autre = masculin (avatar gris)
    const female = s === 'F' || s === Sexe.F;
    const base = '/assets/img';
    return female ? `${base}/user-pink.png` : `${base}/user-grey.png`;
  }

  private async confirmAndDeleteDoctor(id: number) {
    const ok = await this.alerts.confirmDelete('ce docteur');
    if (!ok) return;

    this.doctorService.deleteDoctor(id).subscribe({
      next: () => this.loadDoctors(),
      error: (err: any) => console.error('Error deleting doctor', err)
    });
  }
}
