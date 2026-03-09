import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ButtonComponent } from '../../ui/button/button.component';
import { TableDropdownComponent } from '../../common/table-dropdown/table-dropdown.component';
import { BadgeComponent } from '../../ui/badge/badge.component';

interface Transaction {
  image: string;
  action: string;
  date: string;
  amount: string;
  category: string;
  status: "Success" | "Pending" | "Failed";
}

export type RendezVousRow = {
  id: string;
  patient: string;
  medecin: string;
  date: string;
  heure: string;
  status: 'Confirmé' | 'En attente' | 'Annulé';
};

@Component({
  selector: 'app-basic-table-three',
  imports: [
    CommonModule,
    ButtonComponent,
    TableDropdownComponent,
    BadgeComponent,
  ],
  templateUrl: './basic-table-three.component.html',
  styles: ``
})
export class BasicTableThreeComponent {

  @Input() title: string = 'Latest Transactions';
  @Input() rendezVousData: RendezVousRow[] | null = null;

  // Type definition for the transaction data


  transactionData: Transaction[] = [
    {
      image: "/images/brand/brand-08.svg", // Path or URL for the image
      action: "Bought PYPL", // Action description
      date: "Nov 23, 01:00 PM", // Date and time of the transaction
      amount: "$2,567.88", // Transaction amount
      category: "Finance", // Category of the transaction
      status: "Success",
    },
    {
      image: "/images/brand/brand-07.svg", // Path or URL for the image
      action: "Bought AAPL", // Action description
      date: "Nov 23, 01:00 PM", // Date and time of the transaction
      amount: "$2,567.88", // Transaction amount
      category: "Finance", // Category of the transaction
      status: "Pending",
    },
    {
      image: "/images/brand/brand-15.svg", // Path or URL for the image
      action: "Sell KKST", // Action description
      date: "Nov 23, 01:00 PM", // Date and time of the transaction
      amount: "$2,567.88", // Transaction amount
      category: "Finance", // Category of the transaction
      status: "Success",
    },
    {
      image: "/images/brand/brand-02.svg", // Path or URL for the image
      action: "Bought FB", // Action description
      date: "Nov 23, 01:00 PM", // Date and time of the transaction
      amount: "$2,567.88", // Transaction amount
      category: "Finance", // Category of the transaction
      status: "Success",
    },
    {
      image: "/images/brand/brand-10.svg", // Path or URL for the image
      action: "Sell AMZN", // Action description
      date: "Nov 23, 01:00 PM", // Date and time of the transaction
      amount: "$2,567.88", // Transaction amount
      category: "Finance", // Category of the transaction
      status: "Failed",
    },
    {
      image: "/images/brand/brand-08.svg", // Path or URL for the image
      action: "Bought PYPL", // Action description
      date: "Nov 23, 01:00 PM", // Date and time of the transaction
      amount: "$2,567.88", // Transaction amount
      category: "Finance", // Category of the transaction
      status: "Success",
    },
    {
      image: "/images/brand/brand-07.svg", // Path or URL for the image
      action: "Bought AAPL", // Action description
      date: "Nov 23, 01:00 PM", // Date and time of the transaction
      amount: "$2,567.88", // Transaction amount
      category: "Finance", // Category of the transaction
      status: "Pending",
    },
    {
      image: "/images/brand/brand-15.svg", // Path or URL for the image
      action: "Sell KKST", // Action description
      date: "Nov 23, 01:00 PM", // Date and time of the transaction
      amount: "$2,567.88", // Transaction amount
      category: "Finance", // Category of the transaction
      status: "Success",
    },
    {
      image: "/images/brand/brand-02.svg", // Path or URL for the image
      action: "Bought FB", // Action description
      date: "Nov 23, 01:00 PM", // Date and time of the transaction
      amount: "$2,567.88", // Transaction amount
      category: "Finance", // Category of the transaction
      status: "Success",
    },
    {
      image: "/images/brand/brand-10.svg", // Path or URL for the image
      action: "Sell AMZN", // Action description
      date: "Nov 23, 01:00 PM", // Date and time of the transaction
      amount: "$2,567.88", // Transaction amount
      category: "Finance", // Category of the transaction
      status: "Failed",
    },
    {
      image: "/images/brand/brand-08.svg", // Path or URL for the image
      action: "Bought PYPL", // Action description
      date: "Nov 23, 01:00 PM", // Date and time of the transaction
      amount: "$2,567.88", // Transaction amount
      category: "Finance", // Category of the transaction
      status: "Success",
    },
    {
      image: "/images/brand/brand-07.svg", // Path or URL for the image
      action: "Bought AAPL", // Action description
      date: "Nov 23, 01:00 PM", // Date and time of the transaction
      amount: "$2,567.88", // Transaction amount
      category: "Finance", // Category of the transaction
      status: "Pending",
    },
    {
      image: "/images/brand/brand-15.svg", // Path or URL for the image
      action: "Sell KKST", // Action description
      date: "Nov 23, 01:00 PM", // Date and time of the transaction
      amount: "$2,567.88", // Transaction amount
      category: "Finance", // Category of the transaction
      status: "Success",
    },
    {
      image: "/images/brand/brand-02.svg", // Path or URL for the image
      action: "Bought FB", // Action description
      date: "Nov 23, 01:00 PM", // Date and time of the transaction
      amount: "$2,567.88", // Transaction amount
      category: "Finance", // Category of the transaction
      status: "Success",
    },
    {
      image: "/images/brand/brand-10.svg", // Path or URL for the image
      action: "Sell AMZN", // Action description
      date: "Nov 23, 01:00 PM", // Date and time of the transaction
      amount: "$2,567.88", // Transaction amount
      category: "Finance", // Category of the transaction
      status: "Failed",
    },
  ]

  currentPage = 1;
  itemsPerPage = 5;

  private get isRendezVousMode(): boolean {
    return Array.isArray(this.rendezVousData);
  }

  private get itemsLength(): number {
    if (this.isRendezVousMode) {
      return this.rendezVousData?.length ?? 0;
    }
    return this.transactionData.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.itemsLength / this.itemsPerPage));
  }

  get currentItems(): Transaction[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.transactionData.slice(start, start + this.itemsPerPage);
  }

  get currentRendezVousItems(): RendezVousRow[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return (this.rendezVousData ?? []).slice(start, start + this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  handleViewMore(item: Transaction) {
    // logic here
  }

  handleDelete(item: Transaction) {
    // logic here
  }

  getBadgeColor(status: string): 'success' | 'warning' | 'error' {
    if (status === 'Success' || status === 'Confirmé') return 'success';
    if (status === 'Pending' || status === 'En attente') return 'warning';
    return 'error';
  }
}
