import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { AdminServicesService } from '../../../../core/services/admin-services.service';
import { ServiceRow } from '../../../../core/models/service.model';

@Component({
  selector: 'app-top-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-services.component.html',
})
export class TopServicesComponent implements OnInit {
  private readonly adminServices = inject(AdminServicesService);

  isLoading = true;
  services: ServiceRow[] = [];
  error: string | null = null;

  ngOnInit(): void {
    this.loadServices();
  }

  private loadServices(): void {
    this.isLoading = true;
    this.error = null;
    
    this.adminServices.getAllServices().subscribe({
      next: (data) => {
        this.services = data || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading services:', err);
        this.error = 'Failed to load services';
        this.isLoading = false;
      }
    });
  }
}
