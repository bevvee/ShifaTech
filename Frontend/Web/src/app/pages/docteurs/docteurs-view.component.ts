import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../shared/components/form/input/input-field.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { DoctorService } from '../../core/services/doctor.service';

@Component({
  selector: 'app-docteurs-view',
  standalone: true,
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    ButtonComponent,
    InputFieldComponent,
    LabelComponent,
  ],
  templateUrl: './docteurs-view.component.html',
  styles: ``,
})
export class DocteursViewComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly doctorService = inject(DoctorService);

  doctor: any = null;

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!Number.isFinite(id)) {
      this.router.navigate(['/docteurs']);
      return;
    }

    this.doctorService.getDoctor(id).subscribe({
      next: (d) => (this.doctor = d),
      error: () => this.router.navigate(['/docteurs']),
    });
  }

  close() {
    this.router.navigate(['/docteurs']);
  }
}
