import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexMarkers,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';
import { ErrorHandlerService } from '../../../services/api/error-handler.service';
import { MetalsPricesService } from '../../../services/data/metals-prices.service';
import { ThemeService } from '../../../services/theme.service';
import { TranslationService } from '../../../services/translation.service';

type Period = '7d' | '1m' | '3m';
type Karat = '24' | '22' | '21' | '18' | '14';

interface GoldRatePoint {
  date: string;
  /** 24K price per gram in local currency, as returned by the API */
  gold24: number;
}

/** Historical karat prices are derived from the 24K rate by purity ratio. */
const KARAT_RATIOS: Record<Karat, number> = {
  '24': 1,
  '22': 22 / 24,
  '21': 21 / 24,
  '18': 18 / 24,
  '14': 14 / 24,
};

const PERIOD_LABEL_KEYS: Record<Period, string> = {
  '7d': 'metals.7days',
  '1m': 'metals.1month',
  '3m': 'metals.3months',
};

const GOLD_COLOR = '#d4a853';
const GRID_COLOR = 'rgba(148, 163, 184, 0.2)';

@Component({
  selector: 'app-gold-price-chart',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatButtonToggleModule, NgApexchartsModule],
  templateUrl: './gold-price-chart.component.html',
})
export class GoldPriceChartComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  rates: GoldRatePoint[] = [];
  currency = 'AED';
  period: Period = '1m';
  karat: Karat = '24';
  loading = true;
  loadError = false;
  /** The server's own error message, shown under the generic error title. */
  errorMessage = '';
  /** True when 3m was rejected by the server and we fell back to 1m. */
  periodFallback = false;

  readonly periods: Period[] = ['7d', '1m', '3m'];
  readonly karats: Karat[] = ['24', '22', '21', '18', '14'];

  series: ApexAxisChartSeries = [];
  chart!: ApexChart;
  stroke!: ApexStroke;
  fill!: ApexFill;
  markers!: ApexMarkers;
  grid!: ApexGrid;
  dataLabels!: ApexDataLabels;
  tooltip!: ApexTooltip;
  xaxis!: ApexXAxis;
  yaxis!: ApexYAxis;
  colors: string[] = [GOLD_COLOR];

  constructor(
    public translationService: TranslationService,
    private metalsPricesService: MetalsPricesService,
    private themeService: ThemeService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit() {
    this.load();

    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.rebuildChart());
    this.translationService.currentLanguage
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.rebuildChart());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load() {
    this.loading = true;
    this.loadError = false;
    this.metalsPricesService
      .getHistoricalPrices({ countryCode: 'AE', period: this.period })
      .subscribe({
        next: (response) => {
          if (response.status === 'success' && response.data) {
            this.currency = response.data.currency || this.currency;
            this.rates = this.mapRates(response.data.rates);
          } else {
            this.rates = [];
          }
          this.loading = false;
          this.rebuildChart();
        },
        error: (err) => {
          // The live API currently rejects 3m with a 400 — fall back to 1 month once.
          if (this.period === '3m' && err?.status >= 400 && err?.status < 500) {
            this.period = '1m';
            this.periodFallback = true;
            this.load();
            return;
          }
          this.rates = [];
          this.loading = false;
          this.loadError = true;
          this.errorMessage = this.errorHandler.handleError(err).message;
        },
      });
  }

  retry() {
    this.load();
  }

  /** Public hook for the dashboard "refresh prices" button. */
  reload() {
    this.load();
  }

  /** Tolerant mapping: the API keys `rates` by date, but accept arrays too. */
  private mapRates(raw: unknown): GoldRatePoint[] {
    const list: unknown[] = Array.isArray(raw)
      ? raw
      : raw && typeof raw === 'object'
        ? Object.values(raw)
        : [];
    return list
      .map((entry) => {
        const r = entry as Record<string, unknown>;
        return { date: String(r?.['date'] ?? ''), gold24: Number(r?.['gold_local']) };
      })
      .filter((r) => r.date && Number.isFinite(r.gold24))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /** Segmented-control handlers (no-ops when the active option is re-clicked). */
  setPeriod(period: Period) {
    if (this.period === period) return;
    this.period = period;
    this.periodFallback = false;
    this.load();
  }

  setKarat(karat: Karat) {
    if (this.karat === karat) return;
    this.karat = karat;
    this.rebuildChart();
  }

  periodLabelKey(period: Period): string {
    return PERIOD_LABEL_KEYS[period];
  }

  get values(): number[] {
    const ratio = KARAT_RATIOS[this.karat];
    return this.rates.map((r) => r.gold24 * ratio);
  }

  get currentValue(): number {
    const values = this.values;
    return values.length ? values[values.length - 1] : 0;
  }

  get changePercent(): number {
    const values = this.values;
    if (values.length < 2 || !values[0]) return 0;
    return ((values[values.length - 1] - values[0]) / values[0]) * 100;
  }

  get highValue(): number {
    const values = this.values;
    return values.length ? Math.max(...values) : 0;
  }

  get lowValue(): number {
    const values = this.values;
    return values.length ? Math.min(...values) : 0;
  }

  get averageValue(): number {
    const values = this.values;
    return values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
  }

  get changeBadgeClass(): string {
    if (this.changePercent > 0.05) return 'status-pill-success';
    if (this.changePercent < -0.05) return 'status-pill-error';
    return 'bg-surface-container-high text-surface-on-surface-variant';
  }

  get trendLabel(): string {
    if (this.changePercent > 0.05) return this.translationService.t('dashboard.pulseUp');
    if (this.changePercent < -0.05) return this.translationService.t('dashboard.pulseDown');
    return this.translationService.t('dashboard.pulseStable');
  }

  rebuildChart() {
    if (!this.rates.length) {
      this.series = [];
      return;
    }

    const isDark = this.themeService.currentTheme === 'dark';
    const isRTL = this.translationService.isRTL;
    const fontFamily = isRTL ? 'Cairo, sans-serif' : 'Outfit, sans-serif';
    const labelColor = isDark ? '#b8b0a0' : '#6b7280';
    const locale = isRTL ? 'ar-SA' : 'en-US';

    const categories = this.rates.map((r) =>
      new Date(r.date).toLocaleDateString(locale, { month: 'short', day: 'numeric' })
    );
    const values = this.values.map((v) => Number(v.toFixed(2)));

    this.series = [
      {
        name: `${this.translationService.t('metals.gold')} ${this.karat}K`,
        data: values,
      },
    ];

    this.chart = {
      type: 'area',
      height: 320,
      fontFamily: 'Cairo, Outfit, sans-serif',
      toolbar: { show: false },
      animations: { enabled: true, speed: 400 },
    };

    this.stroke = { curve: 'smooth', width: 3 };

    this.fill = {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: isDark ? 0.35 : 0.45,
        opacityTo: 0.02,
        stops: [0, 100],
      },
    };

    this.markers = {
      size: 0,
      strokeColors: GOLD_COLOR,
      hover: { size: 6 },
    };

    this.grid = {
      borderColor: GRID_COLOR,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 8, bottom: 0, left: 12 },
    };

    this.dataLabels = { enabled: false };

    this.tooltip = {
      theme: isDark ? 'dark' : 'light',
      x: { show: true },
      y: {
        formatter: (value: number) => `${value.toFixed(2)} ${this.currency}`,
      },
    };

    this.xaxis = {
      type: 'category',
      categories,
      labels: {
        style: { colors: labelColor, fontSize: '11px', fontFamily },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    };

    this.yaxis = {
      labels: {
        style: { colors: labelColor, fontSize: '11px', fontFamily },
        formatter: (value: number) => Number(value).toFixed(0),
      },
    };
  }
}
