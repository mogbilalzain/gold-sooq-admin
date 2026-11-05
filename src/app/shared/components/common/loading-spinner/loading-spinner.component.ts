import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center" [ngClass]="containerClass">
      <div class="animate-spin rounded-full border-[color:var(--color-surface-container-high)] border-t-[color:var(--color-primary)]" 
           [ngClass]="spinnerClass"></div>
      @if (message) {
        <span class="ms-3 text-m3-body-md text-[color:var(--color-on-surface-variant)]">{{ message }}</span>
      }
    </div>
  `,
  styles: []
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() message: string = '';
  @Input() fullScreen: boolean = false;

  get containerClass(): string {
    if (this.fullScreen) {
      return 'fixed inset-0 bg-[color:var(--color-surface)]/80 z-50';
    }
    return 'py-8';
  }

  get spinnerClass(): string {
    const sizes = {
      sm: 'h-4 w-4 border-2',
      md: 'h-8 w-8 border-4',
      lg: 'h-12 w-12 border-4'
    };
    return sizes[this.size];
  }
}

