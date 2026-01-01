import { Component, Input } from '@angular/core';

@Component({
  selector: 'st-panel',
  standalone: true,
  templateUrl: './panel.html',
})
export class PanelComponent {
  @Input() heightClass = 'h-40';
}
