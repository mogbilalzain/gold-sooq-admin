import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MetalsPriceData } from '../../charts/metals-prices-chart/metals-prices-chart.component';
import { TranslationService } from '../../../services/translation.service';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

/** M3 card: current gold price, change chip and a small area sparkline. */
@Component({
  selector: 'app-price-pulse',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatIconModule],
  template: `
    <mat-card appearance="outlined" class="h-full">
      <mat-card-header>
        <div mat-card-avatar class="app-tone-primary flex items-center justify-center">
          <mat-icon>bolt</mat-icon>
        </div>
        <mat-card-title class="text-m3-title-lg font-medium">
          {{ translationService.t('dashboard.goldPulse') }}
        </mat-card-title>
        <mat-card-subtitle>
          {{ translationService.t('dashboard.pulsePeriod') }}
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content class="flex-1">
        @if (!data.length) {
          <!-- Skeleton -->
          <div class="animate-pulse space-y-4 pt-2">
            <div class="app-skeleton h-10 w-36"></div>
            <div class="app-skeleton h-5 w-24"></div>
            <div class="app-skeleton h-16 w-full"></div>
          </div>
        } @else {
          <div class="flex h-full flex-col">
            <!-- Current price + change -->
            <div class="mt-2 flex items-end gap-2">
              <span
                class="ayar-num text-m3-display-sm leading-none text-(--mat-sys-on-surface)"
                dir="ltr"
              >
                {{ currentPrice | number: '1.2-2' }}
              </span>
              <span class="mb-0.5 text-m3-body-md text-(--mat-sys-on-surface-variant)">
                {{ currency }}
              </span>
            </div>

            <div class="mt-2.5 flex items-center gap-2">
              <mat-chip-set aria-hidden="true">
                <mat-chip [ngClass]="changeChipClass">
                  <mat-icon>{{ trendIcon }}</mat-icon>
                  <span dir="ltr"
                    >{{ changePercent > 0 ? '+' : '' }}{{ changePercent | number: '1.2-2' }}%</span
                  >
                </mat-chip>
              </mat-chip-set>
              <span class="text-m3-body-md text-(--mat-sys-on-surface-variant)">{{
                trendLabel
              }}</span>
            </div>

            <!-- Area sparkline with first-day / today labels -->
            <div class="mt-auto pt-4">
              <svg
                viewBox="0 0 200 56"
                preserveAspectRatio="none"
                class="h-16 w-full text-(--mat-sys-primary)"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="pulseFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" [attr.stop-color]="strokeColor" stop-opacity="0.28" />
                    <stop offset="100%" [attr.stop-color]="strokeColor" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <path [attr.d]="areaPath" fill="url(#pulseFill)" />
                <path
                  [attr.d]="linePath"
                  fill="none"
                  [attr.stroke]="strokeColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <circle
                  [attr.cx]="lastPoint.x"
                  [attr.cy]="lastPoint.y"
                  r="3.4"
                  [attr.fill]="strokeColor"
                />
              </svg>
              <div
                class="mt-1 flex items-center justify-between text-[11px] text-(--mat-sys-on-surface-variant)"
              >
                <span>{{ firstDateLabel }}</span>
                <span>{{ translationService.t('dashboard.today') }}</span>
              </div>
            </div>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
})
export class PricePulseComponent {
  @Input() data: MetalsPriceData[] = [];
  @Input() currency = '';

  constructor(public translationService: TranslationService) {}

  get currentPrice(): number {
    return this.data.length ? this.data[this.data.length - 1].gold_local : 0;
  }

  /** First day of the series, shown under the sparkline. */
  get firstDateLabel(): string {
    if (!this.data.length) return '';
    const locale = this.translationService.currentLanguageValue === 'ar' ? 'ar-AE' : 'en-GB';
    return new Date(this.data[0].date).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  }

  get changePercent(): number {
    if (this.data.length < 2) return 0;
    const first = this.data[0].gold_local;
    const last = this.data[this.data.length - 1].gold_local;
    if (!first) return 0;
    return ((last - first) / first) * 100;
  }

  get trendLabel(): string {
    if (this.changePercent > 0.05) return this.translationService.t('dashboard.pulseUp');
    if (this.changePercent < -0.05) return this.translationService.t('dashboard.pulseDown');
    return this.translationService.t('dashboard.pulseStable');
  }

  get trendIcon(): string {
    if (this.changePercent > 0.05) return 'trending_up';
    if (this.changePercent < -0.05) return 'trending_down';
    return 'trending_flat';
  }

  get changeChipClass(): string {
    if (this.changePercent > 0.05) return 'app-chip-success';
    if (this.changePercent < -0.05) return 'app-chip-error';
    return '';
  }

  /** Stable trend uses the primary role via currentColor on the svg. */
  get strokeColor(): string {
    if (this.changePercent > 0.05) return '#12b76a';
    if (this.changePercent < -0.05) return '#f04438';
    return 'currentColor';
  }

  private get points(): { x: number; y: number }[] {
    const values = this.data.map((d) => d.gold_local);
    if (values.length < 2) return [];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const w = 200;
    const h = 56;
    const pad = 4;
    return values.map((v, i) => ({
      x: pad + (i / (values.length - 1)) * (w - pad * 2),
      y: pad + (1 - (v - min) / range) * (h - pad * 2),
    }));
  }

  get linePath(): string {
    const pts = this.points;
    if (!pts.length) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  }

  get areaPath(): string {
    const pts = this.points;
    if (!pts.length) return '';
    const first = pts[0];
    const last = pts[pts.length - 1];
    return `${this.linePath} L${last.x.toFixed(1)},56 L${first.x.toFixed(1)},56 Z`;
  }

  get lastPoint(): { x: number; y: number } {
    const pts = this.points;
    return pts.length ? pts[pts.length - 1] : { x: 0, y: 0 };
  }
}
