import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'st-file-upload-drop',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload-drop.html',
})
export class FileUploadDropComponent {
  @Input() accept = 'image/*';
  @Input() maxSizeMb = 2;
  @Input() disabled = false;

  @Input() title = 'Drop your file here or';
  @Input() browseText = 'browse';
  @Input() hint = 'Pick a file up to 2MB.';

  // If backend already has an image URL
  @Input() initialUrl: string | null = null;

  @Output() fileChange = new EventEmitter<File | null>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  file: File | null = null;
  previewUrl: string | null = null;

  // UI states
  isDragging = false;
  progress = 0;
  private timer: any = null;

  ngOnInit() {
    this.previewUrl = this.initialUrl;
  }

  triggerPick() {
    if (this.disabled) return;
    this.fileInput.nativeElement.click();
  }

  onBrowseSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const f = input.files?.[0] ?? null;
    if (!f) return;
    this.handleFile(f);
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    if (this.disabled) return;
    this.isDragging = true;
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    this.isDragging = false;
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    if (this.disabled) return;

    this.isDragging = false;
    const f = e.dataTransfer?.files?.[0] ?? null;
    if (!f) return;

    this.handleFile(f);
  }

  private handleFile(f: File) {
    // validate type
    if (this.accept.startsWith('image/') && !f.type.startsWith('image/')) {
      this.clear();
      return;
    }

    // validate size
    const maxBytes = this.maxSizeMb * 1024 * 1024;
    if (f.size > maxBytes) {
      this.clear();
      return;
    }

    this.file = f;

    // preview
    if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }
    this.previewUrl = URL.createObjectURL(f);

    this.fileChange.emit(f);
    this.startFakeProgress();
  }

  private startFakeProgress() {
    // just to mimic upload progress UI (replace with real upload progress later)
    this.progress = 0;
    if (this.timer) clearInterval(this.timer);

    this.timer = setInterval(() => {
      this.progress += 8;
      if (this.progress >= 100) {
        this.progress = 100;
        clearInterval(this.timer);
        this.timer = null;
      }
    }, 80);
  }

  remove() {
    this.clear();
    this.fileChange.emit(null);
  }

  clear() {
    if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl);
    }
    this.file = null;
    this.previewUrl = this.initialUrl;
    this.progress = 0;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;

    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }
}
