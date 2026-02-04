import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Kpi } from '../../pages/dashboard/dashboard';

@Component({
  selector: 'st-kpi-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-cards.html',
})
export class KpiCardsComponent {
  @Input({ required: true }) kpis: Kpi[] = [];
}
