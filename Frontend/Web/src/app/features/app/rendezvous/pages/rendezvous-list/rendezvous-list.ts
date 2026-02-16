import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'st-rendezvous-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './rendezvous-list.html',
})
export class RendezvousList {}
