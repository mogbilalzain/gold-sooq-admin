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
          <p class="mt-2 text-m3-headline-md font-semibold text-[color:var(--color-on-surface)]">
            {{ value | number }}
            @if (suffix) {
              <span class="text-sm font-normal text-[color:var(--color-on-surface-variant)]">{{ suffix }}</span>
            }
          </p>
          @if (change !== undefined) {
            <div class="mt-2.5 inline-flex items-center gap-1.5 rounded-m3-sm px-2.5 py-1 text-m3-label-md font-medium"
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
          @if (hint) {
            <p class="mt-1.5 text-xs text-[color:var(--color-on-surface-variant)]">{{ hint }}</p>
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

      @if (trend.length >= 2) {
        <svg
          viewBox="0 0 100 28"
          preserveAspectRatio="none"
          class="mt-3 h-7 w-full"
          aria-hidden="true"
        >
          <polyline
            [attr.points]="sparkPoints"
            fill="none"
            [attr.stroke]="trendColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            vector-effect="non-scaling-stroke"
          />
        </svg>
      }

      @if (progress !== undefined) {
        <div class="mt-3">
          <div class="flex items-center justify-between text-xs text-[color:var(--color-on-surface-variant)]">
            <span>{{ progressLabel }}</span>
            <span class="font-semibold text-[color:var(--color-on-surface)]">{{ clampedProgress | number: '1.0-0' }}%</span>
          </div>
          <div class="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
            <div
              class="h-full rounded-full transition-[width] duration-500"
              [style.width.%]="clampedProgress"
              [style.background-color]="trendColor"
            ></div>
          </div>
        </div>
      }
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
  /** Small helper line rendered under the value. */
  @Input() hint: string = '';
  /** Daily series rendered as a small sparkline under the card content. */
  @Input() trend: number[] = [];
  /** 0..100 progress bar; hidden when undefined. */
  @Input() progress: number | undefined;
  @Input() progressLabel: string = '';
  /** Accent color for the sparkline and progress bar. */
  @Input() trendColor: string = '#d4af37';

  Math = Math;

  get clampedProgress(): number {
    const value = this.progress ?? 0;
    return Math.min(100, Math.max(0, value));
  }

  get sparkPoints(): string {
    const values = this.trend;
    if (!values || values.length < 2) return '';
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const w = 100;
    const h = 28;
    const pad = 2;
    return values
      .map((v, i) => {
        const x = pad + (i / (values.length - 1)) * (w - pad * 2);
        const y = pad + (1 - (v - min) / range) * (h - pad * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }
}
