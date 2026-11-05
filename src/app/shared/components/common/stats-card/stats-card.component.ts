import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtmlPipe } from '../../../pipe/safe-html.pipe';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule, SafeHtmlPipe],
  template: `
    <div class="stats-card-modern h-full">
      <div class="relative z-10 flex items-start justify-between gap-4">
        <div class="min-w-0 flex-1">
          <p class="text-m3-title-md font-medium text-[color:var(--color-on-surface-variant)]">{{ title }}</p>
          <p class="mt-3 text-m3-headline-md font-semibold text-[color:var(--color-on-surface)]">
            {{ value | number }}
            @if (suffix) {
              <span class="text-sm font-normal text-[color:var(--color-on-surface-variant)]">{{ suffix }}</span>
            }
          </p>
          @if (change !== undefined) {
            <div class="mt-3 inline-flex items-center gap-1.5 rounded-m3-sm px-2.5 py-1 text-m3-label-md font-medium"
                 [ngClass]="change >= 0
                   ? 'bg-[color:var(--color-success-wash)] text-[color:var(--color-success-wash-text)]'
                   : 'bg-[color:var(--color-error-wash)] text-[color:var(--color-error-wash-text)]'">
              @if (change >= 0) {
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3.33334L12 7.33334H9.33333V12.6667H6.66667V7.33334H4L8 3.33334Z" fill="currentColor"/>
                </svg>
              } @else {
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 12.6667L4 8.66667H6.66667V3.33334H9.33333V8.66667H12L8 12.6667Z" fill="currentColor"/>
                </svg>
              }
              {{ Math.abs(change) }}%
              <span class="font-normal opacity-80">{{ changeLabel }}</span>
            </div>
          }
        </div>
        @if (icon) {
          <div
            class="icon-wrapper flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-m3-md"
            [ngClass]="iconBgClass">
            <span [innerHTML]="icon | safeHtml"></span>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class StatsCardComponent {
  @Input() title: string = '';
  @Input() value: number = 0;
  @Input() suffix: string = '';
  @Input() change: number | undefined;
  @Input() changeLabel: string = 'من الشهر الماضي';
  @Input() icon: string = '';
  @Input() iconBgClass: string = 'bg-[color:var(--color-primary-container)] text-[color:var(--color-on-primary-container)]';

  Math = Math;
}

