import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { UserMetaCardComponent } from '../../shared/components/user-profile/user-meta-card/user-meta-card.component';
import { UserInfoCardComponent } from '../../shared/components/user-profile/user-info-card/user-info-card.component';

import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Store } from '@ngrx/store';
import { selectUserProfile } from '../../core/store/auth/auth.selectors';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    UserMetaCardComponent,
    UserMetaCardComponent,
    UserInfoCardComponent
  ],
  templateUrl: './profile.component.html',
  styles: ``
})
export class ProfileComponent {
  userProfile$: Observable<any>;
  isLoading = true;

  constructor(
    private authService: AuthService,
    private store: Store
  ) {
    this.userProfile$ = this.store.select(selectUserProfile);
  }

  ngOnInit() {
    this.authService.getProfile().subscribe({
      next: (res: any) => {
        // Data is now handled by the NgRx store via AuthService.getProfile
        // which calls hydrateStateFromToken or saveToken logic
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching profile', err);
        this.isLoading = false;
      }
    });
  }
}
