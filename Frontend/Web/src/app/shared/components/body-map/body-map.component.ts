import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { BodyApiService } from '../../../core/services/api/body-api.service';
import { BodyPart, BodySection } from '../../../core/models/body-map.model';

@Component({
  selector: 'app-body-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './body-map.component.html',
  styleUrls: ['./body-map.component.css']
})
export class BodyMapComponent implements OnInit {
  private readonly bodyApi = inject(BodyApiService);

  /** IDs des zones sélectionnées (codes sous forme de string venant du backend symfony) */
  @Input() selectedCodes: string[] = [];
  @Input() readOnly = false;
  @Output() selectionChange = new EventEmitter<string[]>();

  sections: BodySection[] = [];
  activeSection: BodySection | null = null;
  loading = true;

  ngOnInit(): void {
    this.loadMap();
  }

  loadMap(): void {
    this.loading = true;
    this.bodyApi.getBodyMap().subscribe({
      next: (data) => {
        this.sections = data.sort((a, b) => a.order - b.order);
        if (this.sections.length > 0) {
          this.activeSection = this.sections[0];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la carte corporelle', err);
        this.loading = false;
      }
    });
  }

  selectSection(section: BodySection): void {
    this.activeSection = section;
  }

  isSelected(code: string): boolean {
    return this.selectedCodes.includes(code);
  }

  togglePart(part: BodyPart): void {
    if (this.readOnly || !part.is_clickable) return;

    const index = this.selectedCodes.indexOf(part.code);
    if (index > -1) {
      this.selectedCodes.splice(index, 1);
    } else {
      this.selectedCodes.push(part.code);
    }

    this.selectionChange.emit([...this.selectedCodes]);
  }

  get selectedLabels(): string[] {
    const labels: string[] = [];
    for (const section of this.sections) {
      for (const part of section.parts) {
        if (this.isSelected(part.code)) {
          labels.push(part.label);
        }
      }
    }
    // Dédoublonnage au cas où une zone apparaît dans plusieurs sections
    return Array.from(new Set(labels));
  }
}
