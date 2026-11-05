import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

/**
 * Renders a CDN image URL directly (the API returns complete URLs).
 * Shows a consistent placeholder when the URL is null/missing or the
 * image fails to load. Never prefixes or reconstructs URLs.
 */
@Component({
  selector: 'app-safe-image',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (showImage) {
      <img
        [src]="src"
        [alt]="alt"
        [class]="imgClass"
        loading="lazy"
        (error)="onError()"
      />
    } @else {
      <div
        class="flex items-center justify-center bg-surface-container-high text-surface-on-surface-variant"
        [class]="placeholderClass"
        [attr.aria-label]="alt"
        role="img"
      >
        @if (placeholderText) {
          <span class="text-sm font-bold">{{ placeholderText }}</span>
        } @else {
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <circle cx="9" cy="9" r="2"/>
            <path d="m21 15-4.35-4.35a1.5 1.5 0 0 0-2.12 0L6 19"/>
          </svg>
        }
      </div>
    }
  `,
})
export class SafeImageComponent implements OnChanges {
  @Input() src: string | null | undefined;
  @Input() alt = '';
  @Input() imgClass = '';
  @Input() placeholderClass = '';
  @Input() placeholderText = '';

  failed = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src']) {
      this.failed = false;
    }
  }

  get showImage(): boolean {
    return !!this.src && !this.failed;
  }

  onError(): void {
    this.failed = true;
  }
}
