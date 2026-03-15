import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { Role } from '../../core/models/role.enum';
import { selectUserRole } from '../../core/store/auth/auth.selectors';
import { EcommerceMetricsComponent } from '../../shared/components/ecommerce/ecommerce-metrics/ecommerce-metrics.component';
import { MonthlySalesChartComponent } from '../../shared/components/ecommerce/monthly-sales-chart/monthly-sales-chart.component';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, EcommerceMetricsComponent, MonthlySalesChartComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private readonly store = inject(Store);

  readonly Role = Role;

  readonly role$ = this.store.select(selectUserRole).pipe(
    map((role) => (role ? (role.toUpperCase() as Role) : null)),
  );
}
