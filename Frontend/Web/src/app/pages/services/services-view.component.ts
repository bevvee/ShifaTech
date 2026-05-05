import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../shared/components/form/input/input-field.component';
import { TextAreaComponent } from '../../shared/components/form/input/text-area.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { ServiceRow } from '../../core/models/service.model';
import { AdminServicesService } from '../../core/services/admin-services.service';

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
export class ServicesViewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adminServices = inject(AdminServicesService);

  service: ServiceRow | null = null;
  loading = false;
  error: string | null = null;

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!Number.isFinite(id)) {
      this.router.navigate(['/services']);
      return;
    }
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!Number.isFinite(id)) {
      return;
    }

    this.loading = true;
    this.adminServices.getService(id).subscribe({
      next: (service) => {
        this.service = service;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading service:', err);
        this.error = 'Impossible de charger le service';
        this.loading = false;
        this.router.navigate(['/services']);
      }
    });
  }

  close() {
    this.router.navigate(['/services']);
  }
}
