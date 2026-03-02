
import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { UserMetaCardComponent } from '../../shared/components/user-profile/user-meta-card/user-meta-card.component';
import { UserInfoCardComponent } from '../../shared/components/user-profile/user-info-card/user-info-card.component';
import { UserAddressCardComponent } from '../../shared/components/user-profile/user-address-card/user-address-card.component';

import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    UserMetaCardComponent,
    UserInfoCardComponent,
    UserAddressCardComponent
  ],
  templateUrl: './profile.component.html',
  styles: ``
})
export class ProfileComponent {
  userProfile: any = null;
  isLoading = true;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.getProfile().subscribe({
      next: (res) => {
        if (!res.error) {
          this.userProfile = res.data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching profile', err);
        this.isLoading = false;
      }
    });
  }
}
