import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { Role } from '../../core/models/role.enum';
import { selectUserRole } from '../../core/store/auth/auth.selectors';
import { EcommerceMetricsComponent } from '../../shared/components/ecommerce/ecommerce-metrics/ecommerce-metrics.component';
import { MonthlySalesChartComponent } from '../../shared/components/ecommerce/monthly-sales-chart/monthly-sales-chart.component';
import { UpcomingAppointmentsComponent } from '../../shared/components/dashboard/upcoming-appointments/upcoming-appointments.component';
import { AppointmentRequestsComponent } from '../../shared/components/dashboard/appointment-requests/appointment-requests.component';
import { AvailabilityComponent } from '../../shared/components/dashboard/availability/availability.component';
import { AppointmentStatisticsComponent } from '../../shared/components/dashboard/appointment-statistics/appointment-statistics.component';
import { TopPatientsComponent } from '../../shared/components/dashboard/top-patients/top-patients.component';
import { TopServicesComponent } from '../../shared/components/dashboard/top-services/top-services.component';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, EcommerceMetricsComponent, MonthlySalesChartComponent, UpcomingAppointmentsComponent, AppointmentRequestsComponent, AvailabilityComponent, AppointmentStatisticsComponent, TopPatientsComponent, TopServicesComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private readonly store = inject(Store);

  readonly Role = Role;

  readonly role$ = this.store.select(selectUserRole).pipe(
    map((role) => (role ? (role.toUpperCase() as Role) : null)),
  );
}
