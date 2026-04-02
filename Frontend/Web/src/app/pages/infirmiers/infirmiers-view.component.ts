import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../shared/components/form/input/input-field.component';
import { TextAreaComponent } from '../../shared/components/form/input/text-area.component';
import { LabelComponent } from '../../shared/components/form/label/label.component';
import { InfirmierDto } from '../../core/models/infirmier.model';
import { InfirmierService } from '../../core/services/infirmier.service';

@Component({
  selector: 'app-infirmiers-view',
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
  templateUrl: './infirmiers-view.component.html',
  styles: ``,
})
export class InfirmiersViewComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly infirmierService = inject(InfirmierService);

  infirmier: InfirmierDto | null = null;

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;

    if (!Number.isFinite(id)) {
      this.router.navigate(['/infirmiers']);
      return;
    }

    this.infirmierService.getById(id).subscribe({
      next: (data) => {
        this.infirmier = data;
      },
      error: () => this.router.navigate(['/infirmiers'])
    });
  }

  close() {
    this.router.navigate(['/infirmiers']);
  }
}
