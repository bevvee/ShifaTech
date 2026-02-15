import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'st-patients-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './patients-list.html',
})
export class PatientsList {}
