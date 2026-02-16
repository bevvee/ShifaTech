import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'st-services-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './services-list.html',
})
export class ServicesList{}
