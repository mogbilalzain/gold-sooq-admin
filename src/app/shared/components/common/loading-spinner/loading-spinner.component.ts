import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center" [ngClass]="containerClass">
      <div class="animate-spin rounded-full border-4 border-gray-200 border-t-brand-500" 
           [ngClass]="spinnerClass"></div>
      @if (message) {
        <span class="ml-3 text-sm text-gray-600 dark:text-gray-400">{{ message }}</span>
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
      return 'fixed inset-0 bg-white/80 dark:bg-gray-900/80 z-50';
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

