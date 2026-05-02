import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { BodyApiService } from '../../../core/services/api/body-api.service';
import { BodyPart, BodySection } from '../../../core/models/body-map.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-body-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './body-map.component.html',
  styleUrls: ['./body-map.component.css'],
})
export class BodyMapComponent implements OnInit, OnChanges {
  private readonly bodyApi = inject(BodyApiService);

  /** Codes sélectionnés : préférence `sectionCode:partCode` (évite collisions si même code dans 2 vues). */
  @Input() selectedCodes: string[] = [];
  @Input() readOnly = false;
  /** Active des logs console (voir aussi `environment.debugBodyMap`). */
  @Input() debug = environment.debugBodyMap;
  /** When true, only show sections containing selected parts (read-only view mode). */
  @Input() showOnlySelected = false;

  @Output() selectionChange = new EventEmitter<string[]>();
  @Output() selectionLabelsChange = new EventEmitter<string[]>();
  @Output() firstPartIdChange = new EventEmitter<number | null>();

  sections: BodySection[] = [];
  activeSection: BodySection | null = null;
  loading = true;

  hoveredLabel: string | null = null;
  tooltipX = 0;
  tooltipY = 0;
  tooltipWidth = 120;

  ngOnInit(): void {
    this.loadMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedCodes'] && !changes['selectedCodes'].firstChange && this.sections.length > 0) {
      this.normalizeLegacySelectionKeys(true);
      // When showing only selected sections, auto-select the first visible section
      if (this.showOnlySelected && this.visibleSections.length > 0 && !this.activeSection?.code) {
        this.selectSection(this.visibleSections[0]);
      }
    }
  }

  loadMap(): void {
    this.loading = true;
    this.bodyApi.getBodyMap().subscribe({
      next: (data) => {
        this.sections = data.sort((a, b) => a.order - b.order);
        if (this.sections.length > 0) {
          // If showOnlySelected and we have selected codes, set activeSection to first visible section
          if (this.showOnlySelected && this.selectedCodes.length > 0) {
            const visible = this.visibleSections;
            this.activeSection = visible.length > 0 ? visible[0] : this.sections[0];
          } else {
            this.activeSection = this.sections[0];
          }
        }
        if (this.debug) {
          console.debug(
            '[body-map] sections chargées',
            this.sections.map((s) => ({
              code: s.code,
              parts: s.parts.length,
              dims: `${s.width}x${s.height}`,
            })),
          );
        }
        this.loading = false;
        this.normalizeLegacySelectionKeys(true);
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la carte corporelle', err);
        this.loading = false;
      },
    });
  }

  /** Get sections to display: all sections or only those with selected parts depending on showOnlySelected. */
  get visibleSections(): BodySection[] {
    if (!this.showOnlySelected || this.selectedCodes.length === 0) {
      return this.sections;
    }
    // Filter to show only sections that contain at least one selected part
    return this.sections.filter(section =>
      section.parts.some(part => this.isSelected(part.code, section.code))
    );
  }

  selectSection(section: BodySection): void {
    this.activeSection = section;
    this.hoveredLabel = null;
  }

  /** Sélection : clé composite ou ancien format `code` seul (dans la section active uniquement). */
  isSelected(partCode: string, sectionCode: string | undefined): boolean {
    if (!sectionCode) return false;
    const key = this.makeKey(sectionCode, partCode);
    if (this.selectedCodes.includes(key)) return true;
    return (
      this.selectedCodes.includes(partCode) &&
      !!this.activeSection?.parts.some((p) => p.code === partCode && this.activeSection?.code === sectionCode)
    );
  }

  togglePart(part: BodyPart): void {
    if (this.readOnly || !part.is_clickable || !this.activeSection) return;

    const key = this.makeKey(this.activeSection.code, part.code);
    const idx = this.selectedCodes.indexOf(key);
    if (idx > -1) {
      this.selectedCodes.splice(idx, 1);
    } else {
      const legacy = this.selectedCodes.indexOf(part.code);
      if (legacy > -1) this.selectedCodes.splice(legacy, 1);
      this.selectedCodes.push(key);
    }

    this.emitSelection();

    const first = this.selectedCodes[0];
    if (first) {
      const firstPart = this.findPartByKey(first);
      this.firstPartIdChange.emit(firstPart?.id ?? null);
    } else {
      this.firstPartIdChange.emit(null);
    }
  }

  onMouseEnter(part: BodyPart, event: MouseEvent): void {
    if (!part.is_clickable) return;
    this.hoveredLabel = part.label;
    this.tooltipWidth = Math.max(120, Math.min(260, part.label.length * 8 + 18));
    this.updateTooltipPosition(event);
  }

  onMouseMove(event: MouseEvent): void {
    this.updateTooltipPosition(event);
  }

  onMouseLeave(): void {
    this.hoveredLabel = null;
  }

  private updateTooltipPosition(event: MouseEvent): void {
    const svgEl = (event.currentTarget as SVGElement).closest('svg');
    if (svgEl) {
      const rect = svgEl.getBoundingClientRect();
      const desiredX = event.clientX - rect.left + 10;
      const desiredY = event.clientY - rect.top - 30;
      this.tooltipX = Math.max(6, Math.min(desiredX, rect.width - this.tooltipWidth - 6));
      this.tooltipY = Math.max(18, desiredY);
    }
  }

  private findPartByKey(keyOrCode: string): BodyPart | undefined {
    const { sectionCode, partCode } = this.parseKey(keyOrCode);
    for (const section of this.sections) {
      if (sectionCode && section.code !== sectionCode) continue;
      const part = section.parts.find((p) => p.code === partCode);
      if (part) return part;
    }
    return undefined;
  }

  get selectedLabels(): string[] {
    const labels: string[] = [];
    for (const key of this.selectedCodes) {
      const found = this.findPartByKey(key);
      if (found) labels.push(found.label);
    }
    return labels;
  }

  private makeKey(sectionCode: string, partCode: string): string {
    return `${sectionCode}:${partCode}`;
  }

  private parseKey(keyOrCode: string): { sectionCode: string | null; partCode: string } {
    const raw = keyOrCode.trim();
    const i = raw.indexOf(':');
    if (i === -1) return { sectionCode: null, partCode: raw };
    return {
      sectionCode: raw.slice(0, i).trim() || null,
      partCode: raw.slice(i + 1).trim(),
    };
  }

  /**
   * Convertit les anciennes valeurs `code` seul en `section:code` si une seule section contient ce code.
   */
  private normalizeLegacySelectionKeys(emit: boolean): void {
    if (!this.selectedCodes?.length || !this.sections.length) return;

    const next = this.selectedCodes.map((token) => {
      const t = token.trim();
      if (!t) return t;
      if (t.includes(':')) return t;
      const withPart = this.sections.filter((s) => s.parts.some((p) => p.code === t));
      if (withPart.length === 1) {
        return this.makeKey(withPart[0].code, t);
      }
      return t;
    });

    const changed = next.some((v, i) => v !== this.selectedCodes[i]);
    if (!changed) return;

    this.selectedCodes.length = 0;
    this.selectedCodes.push(...next);
    if (emit) {
      this.emitSelection();
    }
  }

  private emitSelection(): void {
    this.selectionChange.emit([...this.selectedCodes]);
    this.selectionLabelsChange.emit([...this.selectedLabels]);
  }
}
