import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

export type KpiTone = 'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'neutral';

/**
 * M3 KPI card for the dashboard home only.
 * Footer variants (pick one via inputs):
 *  - trend:    success "+N" + label + primary sparkline  (trend + trendCount + trendLabel)
 *  - progress: mat-progress-bar + caption                (progress + progressLabel)
 *  - link:     hint + text-button management link        (linkHint + linkText + linkRoute)
 */
@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  template: `
    <mat-card appearance="outlined" class="h-full">
      <div class="flex h-full flex-col p-5">
        <div class="flex items-start justify-between gap-3">
          <p class="pt-1 text-m3-title-sm font-medium text-(--mat-sys-on-surface-variant)">
            {{ title }}
          </p>
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
            [ngClass]="'app-tone-' + tone"
          >
            <mat-icon>{{ icon }}</mat-icon>
          </div>
        </div>

        <div class="mb-4 mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <p class="ayar-num text-m3-display-sm text-(--mat-sys-on-surface)">
            {{ value | number }}
          </p>
          @if (percentPill !== undefined) {
            <mat-chip-set aria-hidden="true">
              <mat-chip class="app-chip-success">
                <span dir="ltr">{{ percentPill | number: '1.0-0' }}%</span>
                {{ percentPillLabel }}
              </mat-chip>
            </mat-chip-set>
          }
        </div>

        <div class="mt-auto">
          <mat-divider></mat-divider>

          @if (trend.length >= 2) {
            <div class="flex items-end justify-between gap-3 pt-4">
              <span
                class="inline-flex flex-wrap items-center gap-1 text-m3-label-md font-medium text-success-600 dark:text-success-300"
              >
                <mat-icon style="font-size: 16px; width: 16px; height: 16px">trending_up</mat-icon>
                <span dir="ltr">+{{ trendCount | number }}</span>
                <span class="font-normal text-(--mat-sys-on-surface-variant)">
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
                  stroke="var(--mat-sys-primary)"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  vector-effect="non-scaling-stroke"
                />
              </svg>
            </div>
          }

          @if (progress !== undefined) {
            <div class="pt-4">
              <mat-progress-bar mode="determinate" [value]="clampedProgress"></mat-progress-bar>
              <p class="mt-2 text-m3-body-md text-(--mat-sys-on-surface-variant)">
                {{ progressLabel }}
              </p>
            </div>
          }

          @if (linkRoute) {
            <div class="flex items-center justify-between gap-2 pt-3">
              <span class="text-m3-body-md text-(--mat-sys-on-surface-variant)">
                {{ linkHint }}
              </span>
              <a matButton="text" [routerLink]="linkRoute" class="app-btn-sm -me-2 shrink-0">
                {{ linkText }}
                <mat-icon class="app-icon-flip">arrow_forward</mat-icon>
              </a>
            </div>
          }
        </div>
      </div>
    </mat-card>
  `,
})
export class KpiCardComponent {
  @Input() title = '';
  @Input() value = 0;
  /** Material Symbols ligature name, e.g. "group". */
  @Input() icon = '';
  /** Role tint for the icon circle. */
  @Input() tone: KpiTone = 'primary';

  /** Small success chip next to the value, e.g. "42% active". */
  @Input() percentPill: number | undefined;
  @Input() percentPillLabel = '';

  /** Trend footer. */
  @Input() trend: number[] = [];
  @Input() trendCount: number | null = null;
  @Input() trendLabel = '';

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
