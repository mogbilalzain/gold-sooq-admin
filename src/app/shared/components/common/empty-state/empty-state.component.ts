import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span
        class="mb-4 flex h-16 w-16 items-center justify-center rounded-m3-lg bg-[color:var(--color-surface-container)] text-[color:var(--color-on-surface-variant)]"
      >
        <ng-content select="[icon]"></ng-content>
        @if (!hasProjectedIcon) {
          <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25m-2.25-2.25l2.25-2.25m-2.25 2.25l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        }
      </span>

      <h3 class="text-m3-title-md font-medium text-[color:var(--color-on-surface)]">
        {{ title }}
      </h3>
      @if (description) {
        <p class="mt-1.5 max-w-sm text-m3-body-md text-[color:var(--color-on-surface-variant)]">
          {{ description }}
        </p>
      }

      @if (actionLabel) {
        <button
          type="button"
          class="modern-button modern-button-primary mt-5 px-6 text-m3-label-lg"
          (click)="action.emit()"
        >
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() actionLabel = '';
  @Input() hasProjectedIcon = false;

  @Output() action = new EventEmitter<void>();
}
