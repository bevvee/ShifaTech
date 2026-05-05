import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../shared/components/form/input/input-field.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { SecretaireDto } from '../../core/models/secretaire.model';
import { SecretaireService } from '../../core/services/secretaire.service';

@Component({
  selector: 'app-secretaires-view',
  standalone: true,
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    ButtonComponent,
    InputFieldComponent,
    LabelComponent,
  ],
  templateUrl: './secretaires-view.component.html',
  styles: ``,
})
export class SecretairesViewComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly secretaireService = inject(SecretaireService);

  secretaire: SecretaireDto | null = null;

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!Number.isFinite(id)) {
      this.router.navigate(['/secretaires']);
      return;
    }

    this.secretaireService.getById(id).subscribe({
      next: (data) => {
        this.secretaire = data;
      },
      error: () => this.router.navigate(['/secretaires'])
    });
  }

  close() {
    this.router.navigate(['/secretaires']);
  }
}
