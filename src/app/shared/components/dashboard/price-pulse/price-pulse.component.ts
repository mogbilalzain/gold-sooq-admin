import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MetalsPriceData } from '../../charts/metals-prices-chart/metals-prices-chart.component';
import { TranslationService } from '../../../services/translation.service';
import { SafeHtmlPipe } from '../../../pipe/safe-html.pipe';

@Component({
  selector: 'app-price-pulse',
  standalone: true,
  imports: [CommonModule, SafeHtmlPipe],
  template: `
    <div class="dashboard-card h-full flex flex-col">
      <!-- Header -->
      <div class="flex items-center mb-5">
        <div>
          <h3 class="dashboard-card-title">
            {{ translationService.t('dashboard.goldPulse') }}
          </h3>
          <p class="dashboard-card-hint">
            {{ translationService.t('dashboard.pulsePeriod') }}
          </p>
        </div>
        <span
          class="ms-auto flex h-11 w-11 items-center justify-center rounded-m3-md bg-[color:var(--color-primary-container)] text-[color:var(--color-on-primary-container)]"
          [innerHTML]="goldIcon | safeHtml"
        ></span>
      </div>

      @if (!data.length) {
        <!-- Skeleton -->
        <div class="animate-pulse space-y-4 flex-1">
          <div class="h-9 w-32 rounded-lg bg-surface-container-high"></div>
          <div class="h-5 w-24 rounded-lg bg-surface-container-high"></div>
          <div class="h-16 w-full rounded-xl bg-surface-container-high"></div>
        </div>
      } @else {
        <!-- Current price + change -->
        <div class="mb-1">
          <p class="text-xs font-medium text-surface-on-surface-variant">
            {{ translationService.t('dashboard.gold24k') }}
          </p>
          <div class="flex items-end gap-3 mt-1">
            <span class="text-m3-headline-md font-semibold text-surface-on-surface">
              {{ currentPrice | number: '1.2-2' }}
            </span>
            <span class="text-sm text-surface-on-surface-variant mb-1">{{ currency }}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 mb-4">
          <span
            class="inline-flex items-center gap-1 rounded-m3-sm px-2.5 py-1 text-m3-label-md font-medium"
            [ngClass]="changeBadgeClass"
          >
            <span class="inline-block w-3.5 h-3.5" [innerHTML]="trendIcon | safeHtml"></span>
            {{ changePercent > 0 ? '+' : '' }}{{ changePercent | number: '1.2-2' }}%
          </span>
          <span class="text-xs text-surface-on-surface-variant">{{ trendLabel }}</span>
        </div>

        <!-- Sparkline -->
        <div class="mt-auto">
          <svg
            viewBox="0 0 200 56"
            preserveAspectRatio="none"
            class="w-full h-16"
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
        </div>
      }
    </div>
  `,
})
export class PricePulseComponent {
  @Input() data: MetalsPriceData[] = [];
  @Input() currency = '';

  readonly goldIcon =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="9" r="5"/><circle cx="16" cy="15" r="5"/><path d="M6.5 7.5h3M14.5 13.5h3"/></svg>';
  readonly upIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>';
  readonly downIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7l10 10M17 9v8H9"/></svg>';
  readonly flatIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14"/></svg>';

  constructor(public translationService: TranslationService) {}

  get currentPrice(): number {
    return this.data.length ? this.data[this.data.length - 1].gold_local : 0;
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
    if (this.changePercent > 0.05) return this.upIcon;
    if (this.changePercent < -0.05) return this.downIcon;
    return this.flatIcon;
  }

  get changeBadgeClass(): string {
    if (this.changePercent > 0.05) {
      return 'status-pill-success';
    }
    if (this.changePercent < -0.05) {
      return 'status-pill-error';
    }
    return 'bg-surface-container-high text-surface-on-surface-variant';
  }

  get strokeColor(): string {
    if (this.changePercent > 0.05) return '#12b76a';
    if (this.changePercent < -0.05) return '#f04438';
    return '#d4af37';
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
