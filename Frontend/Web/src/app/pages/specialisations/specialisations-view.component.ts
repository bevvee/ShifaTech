import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../shared/components/form/input/input-field.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { SpecialityOwner, SpecialityService } from '../../core/services/speciality.service';
import { ServicesCatalogService } from '../../core/services/services-catalog.service';
import { Speciality } from '../../core/models/speciality.model';

@Component({
  selector: 'app-specialisations-view',
  standalone: true,
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    ButtonComponent,
    InputFieldComponent,
    LabelComponent,
  ],
  templateUrl: './specialisations-view.component.html',
  styles: ``,
})
export class SpecialisationsViewComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly specialityService = inject(SpecialityService);
  private readonly servicesCatalog = inject(ServicesCatalogService);

  speciality: Speciality | null = null;
  serviceLabel = '';
  owner: SpecialityOwner = 'doctor';

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    const fromQuery = this.route.snapshot.queryParamMap.get('type');
    this.owner = fromQuery === 'infirmier' ? 'infirmier' : 'doctor';

    if (!Number.isFinite(id)) {
      this.router.navigate(['/specialisations']);
      return;
    }

    this.specialityService.getSpeciality(id, this.owner).subscribe({
      next: (existing) => {
        this.speciality = existing;
        this.serviceLabel = this.servicesCatalog.labelFor(existing.idService);
      },
      error: () => this.router.navigate(['/specialisations']),
    });
  }

  close() {
    this.router.navigate(['/specialisations'], { queryParams: { type: this.owner } });
  }
}
