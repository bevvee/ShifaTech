import { Component } from '@angular/core';
import { StatCardComponent } from '../../../../../shared/ui/stat-card/stat-card';
import { PanelComponent } from '../../../../../shared/ui/panel/panel';

@Component({
  selector: 'st-dashboard-page',
  standalone: true,
  imports: [StatCardComponent, PanelComponent],
  templateUrl: './dashboard.html',
})
export class DashboardComponent {}
