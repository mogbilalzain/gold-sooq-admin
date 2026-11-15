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
    <div class="dashboard-card flex h-full flex-col">
      <!-- Period row: bolt icon + "last 30 days" -->
      <div class="mb-3 flex items-center gap-2">
        <span
          class="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-50 text-gold-600 dark:bg-gold-500/10 dark:text-gold-400"
          [innerHTML]="boltIcon | safeHtml"
        ></span>
        <span class="text-xs font-bold text-slate-400 dark:text-[color:var(--color-on-surface-variant)]">
          {{ translationService.t('dashboard.pulsePeriod') }}
        </span>
      </div>

      <h3 class="text-sm font-medium text-slate-500 dark:text-[color:var(--color-on-surface-variant)]">
        {{ translationService.t('dashboard.goldPulse') }}
      </h3>

      @if (!data.length) {
        <!-- Skeleton -->
        <div class="flex-1 animate-pulse space-y-4 pt-4">
          <div class="h-10 w-36 rounded-lg bg-slate-100 dark:bg-[color:var(--color-surface-container-high)]"></div>
          <div class="h-5 w-24 rounded-lg bg-slate-100 dark:bg-[color:var(--color-surface-container-high)]"></div>
          <div class="h-16 w-full rounded-xl bg-slate-100 dark:bg-[color:var(--color-surface-container-high)]"></div>
        </div>
      } @else {
        <!-- Current price + change -->
        <div class="mt-2 flex items-end gap-2">
          <span class="ayar-num text-4xl font-extrabold leading-none text-slate-900 dark:text-[color:var(--color-on-surface)]" dir="ltr">
            {{ currentPrice | number: '1.2-2' }}
          </span>
          <span class="mb-0.5 text-sm font-medium text-slate-400 dark:text-[color:var(--color-on-surface-variant)]">
            {{ currency }}
          </span>
        </div>

        <div class="mt-2.5 flex items-center gap-2">
          <span
            class="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold"
            [ngClass]="changeBadgeClass"
          >
            <span class="inline-block h-3.5 w-3.5" [innerHTML]="trendIcon | safeHtml"></span>
            <span dir="ltr">{{ changePercent > 0 ? '+' : '' }}{{ changePercent | number: '1.2-2' }}%</span>
          </span>
          <span class="text-xs text-slate-400 dark:text-[color:var(--color-on-surface-variant)]">{{ trendLabel }}</span>
        </div>

        <!-- Area sparkline with first-day / today labels -->
        <div class="mt-auto pt-4">
          <svg
            viewBox="0 0 200 56"
            preserveAspectRatio="none"
            class="h-16 w-full"
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
          <div class="mt-1 flex items-center justify-between text-[11px] text-slate-400 dark:text-[color:var(--color-on-surface-variant)]">
            <span>{{ firstDateLabel }}</span>
            <span>{{ translationService.t('dashboard.today') }}</span>
          </div>
        </div>
      }
    </div>
  `,
})
export class PricePulseComponent {
  @Input() data: MetalsPriceData[] = [];
  @Input() currency = '';

  readonly boltIcon =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/></svg>';
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
