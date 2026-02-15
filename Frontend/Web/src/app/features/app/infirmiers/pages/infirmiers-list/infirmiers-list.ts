import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'st-infirmiers-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './infirmiers-list.html',
})
export class InfirmiersList {}
