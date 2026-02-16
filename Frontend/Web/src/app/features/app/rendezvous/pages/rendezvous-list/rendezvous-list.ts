import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type Rendezvous = {
  date: string;
  patient: string;
  phone: string;
  avatar: string;
  mode: string;
  status: 'Checked Out' | 'Checked In' | 'Cancelled' | 'Schedule' | 'Confirmed';
};

@Component({
  selector: 'st-rendezvous-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rendezvous-list.html',
})
export class RendezvousList {

  rendezvous: Rendezvous[] = [
    {
      date: '30 Apr 2025 - 09:30 AM',
      patient: 'Alberto Ripley',
      phone: '+1 56556 54565',
      avatar: 'https://i.pravatar.cc/40?img=1',
      mode: 'In-person',
      status: 'Checked Out'
    },
    {
      date: '15 Apr 2025 - 11:20 AM',
      patient: 'Susan Babin',
      phone: '+1 65658 95654',
      avatar: 'https://i.pravatar.cc/40?img=2',
      mode: 'Online',
      status: 'Checked In'
    },
    {
      date: '02 Apr 2025 - 08:15 AM',
      patient: 'Carol Lam',
      phone: '+1 55654 56647',
      avatar: 'https://i.pravatar.cc/40?img=3',
      mode: 'In-Person',
      status: 'Cancelled'
    }
  ];

  getStatusClass(status: string) {
    switch (status) {
      case 'Checked Out': return 'bg-indigo-100 text-indigo-700';
      case 'Checked In': return 'bg-yellow-100 text-yellow-700';
      case 'Cancelled': return 'bg-red-100 text-red-600';
      case 'Confirmed': return 'bg-green-100 text-green-700';
      case 'Schedule': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }
}
