import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { BadgeComponent } from '../../shared/components/ui/badge/badge.component';
import { Subscription } from 'rxjs';
import { DoctorService } from '../../core/services/doctor.service';
import { SpecialityService } from '../../core/services/speciality.service';
import { Doctor } from '../../core/models/doctor.model';


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
export class DocteursComponent implements OnInit, OnDestroy {

  docteurs: Doctor[] = [];
  filteredDocteurs: Doctor[] = [];
  searchTerm = '';

  private readonly subscription = new Subscription();

  constructor(
    private readonly router: Router,
    private readonly doctorService: DoctorService,
    private readonly specialityService: SpecialityService
  ) { }

  ngOnInit() {
    this.loadDoctors();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadDoctors() {
    this.doctorService.getDoctors().subscribe({
      next: (data) => {
        this.docteurs = data;
        this.filteredDocteurs = data;
      },
      error: (err: any) => console.error('Error loading doctors', err)
    });
  }

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

  goToEdit(id: number) {
    this.router.navigate(['/docteurs', id, 'edit']);
  }

  deleteDoctor(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce docteur ?')) {
      this.doctorService.deleteDoctor(id).subscribe({
        next: () => this.loadDoctors(),
        error: (err: any) => console.error('Error deleting doctor', err)
      });
    }
  }
}
