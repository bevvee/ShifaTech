import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../shared/components/form/input/input-field.component';
import { TextAreaComponent } from '../../shared/components/form/input/text-area.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { ServiceRow } from '../../core/models/service.model';
import { ServicesCatalogService } from '../../core/services/services-catalog.service';

@Component({
  selector: 'app-services-view',
  standalone: true,
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    ButtonComponent,
    InputFieldComponent,
    TextAreaComponent,
    LabelComponent,
  ],
  templateUrl: './services-view.component.html',
  styles: ``,
})
export class ServicesViewComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly servicesCatalog = inject(ServicesCatalogService);

  service: ServiceRow | null = null;

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!Number.isFinite(id)) {
      this.router.navigate(['/services']);
      return;
    }

    this.service = this.servicesCatalog.getAll().find((s) => s.id === id) ?? null;

    if (!this.service) {
      this.router.navigate(['/services']);
    }
  }

  close() {
    this.router.navigate(['/services']);
  }
}
