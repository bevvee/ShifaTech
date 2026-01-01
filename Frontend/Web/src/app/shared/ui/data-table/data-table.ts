import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

export type ColumnDef<T> = {
  key: keyof T | string;
  header: string;
  cell: (row: T) => string;
};

@Component({
  selector: 'st-data-table',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  templateUrl: './data-table.html',
})
export class DataTableComponent<T> {
  @Input({ required: true }) data: T[] = [];
  @Input({ required: true }) columns: ColumnDef<T>[] = [];

  get displayedColumns(): string[] {
    return this.columns.map(c => String(c.key));
  }

  colId(key: keyof T | string): string {
    return String(key);
  }
}
