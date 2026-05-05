import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentCardComponent } from '../component-card/component-card.component';

@Component({
  selector: 'app-list-card',
  imports: [CommonModule, ComponentCardComponent],
  templateUrl: './list-card.component.html',
  styles: ``,
})
export class ListCardComponent {
  @Input() title: string = '';
  @Input() total: any = null;
}
