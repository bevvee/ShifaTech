import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Patient {
  id: number;
  name: string;
  phone: string;
  appointments: number;
  avatar: string;
}

@Component({
  selector: 'app-top-patients',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-patients.component.html',
})
export class TopPatientsComponent implements OnInit {
  patients: Patient[] = [];

  ngOnInit() {
    this.loadTopPatients();
  }

  loadTopPatients() {
    this.patients = [
      { id: 1, name: 'Alberto Ripley', phone: '+1 56556 54565', appointments: 20, avatar: 'AR' },
      { id: 2, name: 'Susan Babin', phone: '+1 65658 95654', appointments: 18, avatar: 'SB' },
      { id: 3, name: 'Carol Lam', phone: '+1 55654 56647', appointments: 16, avatar: 'CL' },
      { id: 4, name: 'Marsha Noland', phone: '+1 65668 54558', appointments: 14, avatar: 'MN' },
      { id: 5, name: 'Irma Armstrong', phone: '+1 45214 66568', appointments: 12, avatar: 'IA' },
    ];
  }

  getAvatarColor(index: number): string {
    const colors = [
      'bg-blue-500',
      'bg-pink-500',
      'bg-purple-500',
      'bg-indigo-500',
      'bg-gray-500',
    ];
    return colors[index % colors.length];
  }
}
