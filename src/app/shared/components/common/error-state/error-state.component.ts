import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span
        class="mb-4 flex h-16 w-16 items-center justify-center rounded-m3-lg bg-[color:var(--color-error-container)] text-[color:var(--color-on-error-container)]"
      >
        <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </span>

      <h3 class="text-m3-title-md font-medium text-[color:var(--color-on-surface)]">
        {{ title || translationService.t('common.errorTitle') }}
      </h3>
      @if (message) {
        <p class="mt-1.5 max-w-md text-m3-body-md text-[color:var(--color-on-surface-variant)]">
          {{ message }}
        </p>
      }

      <button
        type="button"
        class="modern-button modern-button-secondary mt-5 px-6 text-m3-label-lg"
        (click)="retry.emit()"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992V4.356m-.001 0l-3.181 3.183a8.25 8.25 0 00-13.803 3.7M4.031 9.865H-.961m.001 0V4.874m0 4.99l3.181-3.182" transform="translate(4 3)" />
        </svg>
        {{ retryLabel || translationService.t('common.retry') }}
      </button>
    </div>
  `,
})
export class ErrorStateComponent {
  @Input() title = '';
  @Input() message = '';
  @Input() retryLabel = '';

  @Output() retry = new EventEmitter<void>();

  constructor(public translationService: TranslationService) {}
}
