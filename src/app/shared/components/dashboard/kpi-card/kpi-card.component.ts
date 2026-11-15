import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SafeHtmlPipe } from '../../../pipe/safe-html.pipe';

/**
 * Stitch KPI card for the dashboard home only.
 * Footer variants (pick one via inputs):
 *  - trend:    green "+N" + label + sparkline       (trend + trendCount + trendLabel)
 *  - progress: gold gradient bar + caption          (progress + progressLabel)
 *  - link:     hint + management link               (linkHint + linkText + linkRoute)
 */
@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeHtmlPipe],
  template: `
    <div class="dashboard-card flex h-full flex-col">
      <div class="flex items-start justify-between gap-3">
        <p class="pt-1 text-sm font-medium text-slate-500 dark:text-[color:var(--color-on-surface-variant)]">
          {{ title }}
        </p>
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          [ngClass]="iconBgClass"
        >
          <span class="kpi-icon" [innerHTML]="icon | safeHtml"></span>
        </div>
      </div>

      <div class="mb-4 mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
        <p class="ayar-num text-3xl font-extrabold text-slate-900 dark:text-[color:var(--color-on-surface)]">
          {{ value | number }}
        </p>
        @if (percentPill !== undefined) {
          <span class="ayar-pill ayar-pill-success" dir="ltr">
            {{ percentPill | number: '1.0-0' }}%
            <span dir="auto">{{ percentPillLabel }}</span>
          </span>
        }
      </div>

      <div class="kpi-card-footer">
        @if (trend.length >= 2) {
          <div class="flex items-end justify-between gap-3">
            <span class="inline-flex flex-wrap items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 3.33334L12 7.33334H9.33333V12.6667H6.66667V7.33334H4L8 3.33334Z" fill="currentColor" />
              </svg>
              <span dir="ltr">+{{ trendCount | number }}</span>
              <span class="font-medium text-slate-400 dark:text-[color:var(--color-on-surface-variant)]">
                {{ trendLabel }}
              </span>
            </span>
            <svg
              viewBox="0 0 100 28"
              preserveAspectRatio="none"
              class="h-7 w-20 shrink-0"
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
          </div>
        }

        @if (progress !== undefined) {
          <div>
            <div class="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[color:var(--color-surface-container-high)]">
              <div
                class="gold-gradient-bg h-full rounded-full transition-[width] duration-500"
                [style.width.%]="clampedProgress"
              ></div>
            </div>
            <p class="mt-2 text-xs text-slate-400 dark:text-[color:var(--color-on-surface-variant)]">
              {{ progressLabel }}
            </p>
          </div>
        }

        @if (linkRoute) {
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs text-slate-400 dark:text-[color:var(--color-on-surface-variant)]">
              {{ linkHint }}
            </span>
            <a
              [routerLink]="linkRoute"
              class="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-gold-600 transition-colors hover:text-gold-700 dark:text-gold-400 dark:hover:text-gold-300"
            >
              {{ linkText }}
              <svg class="attention-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .kpi-icon {
        display: inline-flex;
        height: 1.375rem;
        width: 1.375rem;
      }
      .kpi-icon > svg {
        height: 100%;
        width: 100%;
      }
      .kpi-card-footer {
        margin-top: auto;
        padding-top: 1rem;
        border-top: 1px solid #f1f5f9;
      }
      :host-context(.dark) .kpi-card-footer {
        border-top-color: var(--color-outline-variant);
      }
    `,
  ],
})
export class KpiCardComponent {
  @Input() title = '';
  @Input() value = 0;
  @Input() icon = '';
  @Input() iconBgClass = 'bg-gold-50 text-gold-600 dark:bg-gold-500/10 dark:text-gold-400';

  /** Small success pill next to the value, e.g. "42% active". */
  @Input() percentPill: number | undefined;
  @Input() percentPillLabel = '';

  /** Trend footer. */
  @Input() trend: number[] = [];
  @Input() trendCount: number | null = null;
  @Input() trendLabel = '';
  @Input() trendColor = '#d4a853';

  /** Progress footer (0..100). */
  @Input() progress: number | undefined;
  @Input() progressLabel = '';

  /** Link footer. */
  @Input() linkHint = '';
  @Input() linkText = '';
  @Input() linkRoute: string | null = null;

  get clampedProgress(): number {
    return Math.min(100, Math.max(0, this.progress ?? 0));
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
