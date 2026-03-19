import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { BadgeComponent } from '../../shared/components/ui/badge/badge.component';
import { DoctorService } from '../../core/services/doctor.service';
import { Doctor } from '../../core/models/doctor.model';
import { AlertService } from '../../core/services/alert.service';


@Component({
  selector: 'app-docteurs',
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    ButtonComponent,
    BadgeComponent,
  ],
  templateUrl: './docteurs.component.html',
  styles: ``
})
export class DocteursComponent {

  docteurs: Doctor[] = [];

  constructor(
    private readonly router: Router,
    private readonly doctorService: DoctorService,
    private readonly alerts: AlertService,
  ) { }

  loadDoctors() {
    this.doctorService.getDoctors().subscribe({
      next: (data) => {
        this.docteurs = data;
        this.filteredDocteurs = data;
      },
      error: (err: any) => console.error('Error loading doctors', err)
    });
  }

  ngOnInit() {
    this.loadDoctors();
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

  private async confirmAndDeleteDoctor(id: number) {
    const ok = await this.alerts.confirmDelete('ce docteur');
    if (!ok) return;

    this.doctorService.deleteDoctor(id).subscribe({
      next: () => this.loadDoctors(),
      error: (err: any) => console.error('Error deleting doctor', err)
    });
  }
}
