import { Component, Input } from '@angular/core';

@Component({
  selector: 'st-stat-card',
  standalone: true,
  templateUrl: './stat-card.html',
})
export class StatCardComponent {
  @Input({ required: true }) title = '';
  @Input() value: string | number = '';
}
