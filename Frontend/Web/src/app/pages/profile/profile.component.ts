import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Store } from '@ngrx/store';
import { selectUserProfile } from '../../core/store/auth/auth.selectors';
import { Observable } from 'rxjs';
import { Role } from '../../core/models/role.enum';

interface AvailabilityDay {
  label: string;
  slots: string[];
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './profile.component.html',
  styles: ``
})
export class ProfileComponent {
  userProfile$: Observable<any>;
  isLoading = true;
  selectedAvailabilityIndex = 0;

  readonly availabilityDays: AvailabilityDay[] = [
    { label: 'Monday', slots: ['11:30 AM - 12:30 PM', '06:00 PM - 07:30 PM'] },
    { label: 'Tuesday', slots: ['12:30 PM - 01:30 PM', '07:00 PM - 08:30 PM'] },
    { label: 'Wednesday', slots: ['02:30 PM - 03:30 PM', '09:00 PM - 11:00 PM'] },
    { label: 'Thursday', slots: ['04:30 PM - 05:30 PM', '11:00 PM - 11:30 PM'] },
    { label: 'Friday', slots: ['10:00 AM - 12:00 PM', '03:00 PM - 04:30 PM'] },
  ];

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

  selectAvailability(index: number) {
    this.selectedAvailabilityIndex = index;
  }

  get selectedAvailability(): AvailabilityDay {
    return this.availabilityDays[this.selectedAvailabilityIndex] ?? this.availabilityDays[0];
  }

  displayName(user: any): string {
    const fullName = [user?.prenom, user?.nom].filter(Boolean).join(' ').trim();
    return fullName || 'User Profile';
  }

  getInitials(user: any): string {
    const first = String(user?.prenom ?? '').trim().charAt(0);
    const last = String(user?.nom ?? '').trim().charAt(0);
    const initials = `${first}${last}`.trim();
    return initials || 'U';
  }

  isDoctorProfile(user: any): boolean {
    const role = String(user?.role ?? '').trim().toUpperCase();
    return role === Role.DOCTEUR || role === 'DOCTOR' || !!user?.specialiteLabel || !!user?.numeroOrdre;
  }

  specialtyLabel(user: any): string {
    return user?.specialiteLabel || user?.specialite || user?.role || 'General Practice';
  }

  professionalTitle(user: any): string {
    if (this.isDoctorProfile(user)) {
      return `${this.specialtyLabel(user)} specialist`;
    }

    return 'Profile information';
  }

  clinicLabel(user: any): string {
    return user?.clinicName || user?.adresse || 'Downtown Medical Clinic';
  }

  statusLabel(user: any): string {
    return user?.statut ? 'Available' : 'Unavailable';
  }

  consultationCharge(user: any): string {
    return this.isDoctorProfile(user) ? '$499' : 'On request';
  }

  consultationDuration(user: any): string {
    return this.isDoctorProfile(user) ? '/ 30 Min' : '';
  }

  licenseNumber(user: any): string {
    return user?.numeroOrdre || user?.cin || 'Non renseigné';
  }

  aboutText(user: any): string {
    if (this.isDoctorProfile(user)) {
      return `Dr. ${this.displayName(user)} provides attentive, patient-focused care in ${this.specialtyLabel(user)}. Book a consultation for diagnosis, treatment planning, and follow-up care.`;
    }

    return 'Keep your contact details and personal information up to date so the care team can reach you quickly when needed.';
  }
}
