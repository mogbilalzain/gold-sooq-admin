import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexLegend,
  ApexPlotOptions,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';
import { StatsDailyPoint } from '../../../services/data/stats.service';
import { ThemeService } from '../../../services/theme.service';
import { TranslationService } from '../../../services/translation.service';

const USERS_COLOR = '#5b8def';
const ADS_COLOR = '#d4af37';
const GRID_COLOR = 'rgba(206, 198, 178, 0.35)';

@Component({
  selector: 'app-activity-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div
      class="rounded-m3-lg border border-outline-variant/50 bg-surface-container-lowest p-6 shadow-elevation-1 dark:border-outline-variant dark:bg-surface-container h-full"
    >
      <div class="flex flex-wrap items-start gap-4 mb-4">
        <div>
          <h3 class="text-m3-title-lg font-medium text-surface-on-surface">
            {{ translationService.t('dashboard.activityChart') }}
          </h3>
          <p class="text-sm text-surface-on-surface-variant mt-0.5">
            {{ translationService.t('dashboard.activityChartHint') }}
          </p>
        </div>
        @if (!loading && daily.length) {
          <div class="ms-auto flex gap-4">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 shrink-0 rounded-sm" [style.background-color]="usersColor"></span>
              <span class="text-xs text-surface-on-surface-variant">{{ translationService.t('dashboard.newUsers') }}</span>
              <span class="text-sm font-semibold text-surface-on-surface">{{ totalUsers }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 shrink-0 rounded-sm" [style.background-color]="adsColor"></span>
              <span class="text-xs text-surface-on-surface-variant">{{ translationService.t('dashboard.newAds') }}</span>
              <span class="text-sm font-semibold text-surface-on-surface">{{ totalAds }}</span>
            </div>
          </div>
        }
      </div>

      @if (loading) {
        <div class="animate-pulse h-[300px] w-full rounded-xl bg-surface-container-high"></div>
      } @else if (!daily.length) {
        <div class="flex h-[300px] items-center justify-center">
          <p class="text-surface-on-surface-variant">{{ translationService.t('dashboard.statsLoadError') }}</p>
        </div>
      } @else {
        <apx-chart
          [series]="series"
          [chart]="chart"
          [colors]="colors"
          [plotOptions]="plotOptions"
          [grid]="grid"
          [dataLabels]="dataLabels"
          [legend]="legend"
          [tooltip]="tooltip"
          [xaxis]="xaxis"
          [yaxis]="yaxis"
        ></apx-chart>
      }
    </div>
  `,
})
export class ActivityChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() daily: StatsDailyPoint[] = [];
  @Input() loading = false;

  private readonly destroy$ = new Subject<void>();

  series: ApexAxisChartSeries = [];
  chart!: ApexChart;
  plotOptions!: ApexPlotOptions;
  grid!: ApexGrid;
  dataLabels!: ApexDataLabels;
  legend!: ApexLegend;
  tooltip!: ApexTooltip;
  xaxis!: ApexXAxis;
  yaxis!: ApexYAxis;
  colors: string[] = [USERS_COLOR, ADS_COLOR];
  readonly usersColor = USERS_COLOR;
  readonly adsColor = ADS_COLOR;

  constructor(
    public translationService: TranslationService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.rebuildChart());
    this.translationService.currentLanguage
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.rebuildChart());
  }

  ngOnChanges() {
    this.rebuildChart();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get totalUsers(): number {
    return this.daily.reduce((sum, d) => sum + d.users, 0);
  }

  get totalAds(): number {
    return this.daily.reduce((sum, d) => sum + d.ads, 0);
  }

  rebuildChart() {
    if (!this.daily.length) {
      this.series = [];
      return;
    }

    const isDark = this.themeService.currentTheme === 'dark';
    const isRTL = this.translationService.isRTL;
    const fontFamily = isRTL ? 'Tajawal, sans-serif' : 'Outfit, sans-serif';
    const labelColor = isDark ? '#b8b0a0' : '#6b7280';
    const locale = isRTL ? 'ar-SA' : 'en-US';

    // `date` is already a Dubai calendar day; format it as UTC so the browser timezone can't shift it.
    const categories = this.daily.map((d) =>
      new Date(`${d.date}T00:00:00Z`).toLocaleDateString(locale, { month: 'short', day: 'numeric', timeZone: 'UTC' })
    );

    this.series = [
      { name: this.translationService.t('dashboard.newUsers'), data: this.daily.map((d) => d.users) },
      { name: this.translationService.t('dashboard.newAds'), data: this.daily.map((d) => d.ads) },
    ];

    this.chart = {
      type: 'bar',
      height: 300,
      fontFamily: 'Tajawal, Outfit, sans-serif',
      toolbar: { show: false },
      animations: { enabled: true, speed: 400 },
    };

    this.plotOptions = {
      bar: { columnWidth: '55%', borderRadius: 3 },
    };

    this.grid = {
      borderColor: GRID_COLOR,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 8, bottom: 0, left: 12 },
    };

    this.dataLabels = { enabled: false };

    // The Apex legend always draws its marker left of the label; an HTML
    // legend in the header row follows the language direction instead.
    this.legend = { show: false };

    this.tooltip = { theme: isDark ? 'dark' : 'light', shared: true, intersect: false };

    this.xaxis = {
      type: 'category',
      categories,
      labels: {
        style: { colors: labelColor, fontSize: '11px', fontFamily },
        rotate: -45,
        hideOverlappingLabels: true,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    };

    this.yaxis = {
      min: 0,
      forceNiceScale: true,
      labels: {
        style: { colors: labelColor, fontSize: '11px', fontFamily },
        formatter: (value: number) => Number(value).toFixed(0),
      },
    };
  }
}
