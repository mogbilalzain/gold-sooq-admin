import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';
import { SafeHtmlPipe } from '../../../pipe/safe-html.pipe';

type BadgeVariant = 'light' | 'solid';
type BadgeSize = 'sm' | 'md';
type BadgeColor = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark';

@Component({
  selector: 'app-badge',
  imports: [CommonModule, SafeHtmlPipe],
  templateUrl: './badge.component.html',
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'light';
  @Input() size: BadgeSize = 'md';
  @Input() color: BadgeColor = 'primary';
  @Input() startIcon?: string;
  @Input() endIcon?: string;

  @HostBinding('class') get hostClasses(): string {
    return 'flex';
  }

  get baseStyles() {
    // M3 tonal label: small-shape container, medium weight
    return 'inline-flex items-center px-2.5 py-1 justify-center gap-1.5 rounded-m3-sm font-medium tracking-[0.03em]';
  }

  get sizeClass() {
    return {
      sm: 'text-[11px] leading-4',
      md: 'text-xs leading-4',
    }[this.size];
  }

  get colorStyles() {
    // Light variant uses the new status washes (pastel pastel + high-contrast text).
    const variants = {
      light: {
        primary:
          'bg-[color:var(--color-primary-container)] text-[color:var(--color-on-primary-container)]',
        success:
          'bg-[color:var(--color-success-wash)] text-[color:var(--color-success-wash-text)]',
        error:
          'bg-[color:var(--color-error-wash)] text-[color:var(--color-error-wash-text)]',
        warning:
          'bg-[color:var(--color-warning-wash)] text-[color:var(--color-warning-wash-text)]',
        info:
          'bg-[color:var(--color-info-wash)] text-[color:var(--color-info-wash-text)]',
        light:
          'bg-[color:var(--color-surface-container)] text-[color:var(--color-on-surface-variant)]',
        dark:
          'bg-[color:var(--color-inverse-surface)] text-[color:var(--color-inverse-on-surface)]',
      },
      solid: {
        primary: 'bg-brand-500 text-white',
        success: 'bg-success-500 text-white',
        error: 'bg-error-500 text-white',
        warning: 'bg-warning-500 text-white',
        info: 'bg-blue-light-500 text-white',
        light: 'bg-gray-400 text-white',
        dark: 'bg-gray-700 text-white',
      },
    };
    return variants[this.variant][this.color];
  }
}