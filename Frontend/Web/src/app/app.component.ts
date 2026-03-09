import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastComponent } from './shared/components/common/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    ToastComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'ShifaTech';
}
