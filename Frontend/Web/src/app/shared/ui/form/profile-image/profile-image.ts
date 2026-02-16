import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'st-profile-image',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-image.html',
})
export class ProfileImageComponent {
  @Input() label = 'Upload photo';
  @Input() accept = 'image/*';
  @Input() disabled = false;

  // If you already have an image from API (url), pass it here
  @Input() initialUrl: string | null = null;

  // Emits selected file to parent (for API upload)
  @Output() fileChange = new EventEmitter<File | null>();

  // Emits "delete" action explicitly if you need (optional)
  @Output() cleared = new EventEmitter<void>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  previewUrl: string | null = null;

  ngOnInit() {
    // show initial image if exists
    this.previewUrl = this.initialUrl;
  }

  triggerPick() {
    if (this.disabled) return;
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // guard: only images
    if (!file.type.startsWith('image/')) {
      this.clear();
      return;
    }

    this.previewUrl = URL.createObjectURL(file);
    this.fileChange.emit(file);
  }

  clear() {
    // cleanup preview blob
    if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }

    this.previewUrl = this.initialUrl; // fallback to initial url if any
    this.fileInput.nativeElement.value = '';
    this.fileChange.emit(null);
    this.cleared.emit();
  }
}
