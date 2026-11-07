import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';
import { SiteAnalyticsDailyPoint } from '../../../services/data/site-analytics.service';
import { ThemeService } from '../../../services/theme.service';
import { TranslationService } from '../../../services/translation.service';

const VISITORS_COLOR = '#5b8def';
const PAGE_VIEWS_COLOR = '#9b8afb';
const DOWNLOADS_COLOR = '#d4af37';
const GRID_COLOR = 'rgba(206, 198, 178, 0.35)';

@Component({
  selector: 'app-site-visits-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div
      class="rounded-m3-lg border border-outline-variant/50 bg-surface-container-lowest p-6 shadow-elevation-1 dark:border-outline-variant dark:bg-surface-container h-full"
    >
      <div class="flex flex-wrap items-start gap-4 mb-4">
        <h3 class="text-m3-title-lg font-medium text-surface-on-surface">
          {{ translationService.t('siteAnalytics.dailyChart') }}
        </h3>
        @if (!loading && daily.length) {
          <div class="ms-auto flex flex-wrap gap-4">
            @for (item of legendItems; track item.key) {
              <div class="flex items-center gap-2">
                <span class="h-2.5 w-2.5 shrink-0 rounded-sm" [style.background-color]="item.color"></span>
                <span class="text-xs text-surface-on-surface-variant">{{ translationService.t(item.key) }}</span>
              </div>
            }
          </div>
        }
      </div>

      @if (loading) {
        <div class="animate-pulse h-[300px] w-full rounded-xl bg-surface-container-high"></div>
      } @else if (!daily.length) {
        <div class="flex h-[300px] items-center justify-center">
          <p class="text-surface-on-surface-variant">{{ translationService.t('siteAnalytics.loadError') }}</p>
        </div>
      } @else {
        <apx-chart
          [series]="series"
          [chart]="chart"
          [colors]="colors"
          [stroke]="stroke"
          [fill]="fill"
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
export class SiteVisitsChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() daily: SiteAnalyticsDailyPoint[] = [];
  @Input() loading = false;

  private readonly destroy$ = new Subject<void>();

  readonly legendItems = [
    { key: 'siteAnalytics.visitors', color: VISITORS_COLOR },
    { key: 'siteAnalytics.pageViews', color: PAGE_VIEWS_COLOR },
    { key: 'siteAnalytics.downloadClicks', color: DOWNLOADS_COLOR },
  ];

  series: ApexAxisChartSeries = [];
  chart!: ApexChart;
  stroke!: ApexStroke;
  fill!: ApexFill;
  grid!: ApexGrid;
  dataLabels!: ApexDataLabels;
  legend!: ApexLegend;
  tooltip!: ApexTooltip;
  xaxis!: ApexXAxis;
  yaxis!: ApexYAxis;
  colors: string[] = [VISITORS_COLOR, PAGE_VIEWS_COLOR, DOWNLOADS_COLOR];

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

    const t = (key: string) => this.translationService.t(key);
    this.series = [
      { name: t('siteAnalytics.visitors'), data: this.daily.map((d) => d.visitors) },
      { name: t('siteAnalytics.pageViews'), data: this.daily.map((d) => d.pageViews) },
      { name: t('siteAnalytics.downloadClicks'), data: this.daily.map((d) => d.downloads) },
    ];

    this.chart = {
      type: 'area',
      height: 300,
      fontFamily: 'Tajawal, Outfit, sans-serif',
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true, speed: 400 },
    };

    this.stroke = { curve: 'smooth', width: 2 };
    this.fill = { type: 'gradient', gradient: { opacityFrom: 0.35, opacityTo: 0.02 } };

    this.grid = {
      borderColor: GRID_COLOR,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 8, bottom: 0, left: 12 },
    };

    this.dataLabels = { enabled: false };

    // HTML legend in the header row follows the language direction.
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
