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
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { StatsDailyPoint } from '../../../services/data/stats.service';
import { ThemeService } from '../../../services/theme.service';
import { TranslationService } from '../../../services/translation.service';

// M3 role colors: users = tertiary, ads = primary (per light/dark theme).
const USERS_LIGHT = '#0053db';
const USERS_DARK = '#b4c5ff';
const ADS_LIGHT = '#b88730';
const ADS_DARK = '#e3be82';
const GRID_COLOR = 'rgba(148, 163, 184, 0.2)';

type ActivityPeriod = 'weekly' | 'monthly';

@Component({
  selector: 'app-activity-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, MatButtonToggleModule, MatCardModule],
  template: `
    <mat-card appearance="outlined" class="h-full">
      <mat-card-header class="flex-wrap justify-between gap-3">
        <div class="min-w-0">
          <mat-card-title class="text-m3-title-lg font-medium">
            {{ translationService.t('dashboard.activityDaily') }}
          </mat-card-title>
          <mat-card-subtitle>
            {{ translationService.t('dashboard.activityChartHint') }}
          </mat-card-subtitle>
        </div>
        <mat-button-toggle-group
          class="shrink-0"
          [value]="period"
          (change)="setPeriod($event.value)"
        >
          <mat-button-toggle value="weekly">
            {{ translationService.t('dashboard.weekly') }}
          </mat-button-toggle>
          <mat-button-toggle value="monthly">
            {{ translationService.t('dashboard.monthly') }}
          </mat-button-toggle>
        </mat-button-toggle-group>
      </mat-card-header>

      <mat-card-content>
        @if (!loading && visibleDaily.length) {
          <!-- Legend with totals in parentheses -->
          <div class="mb-3 flex flex-wrap gap-x-5 gap-y-1.5">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 shrink-0 rounded-sm" [style.background-color]="usersColor"></span>
              <span class="text-m3-body-md text-(--mat-sys-on-surface-variant)">
                {{ translationService.t('dashboard.newUsers') }}
                <span class="ayar-num font-medium text-(--mat-sys-on-surface)" dir="ltr">({{ totalUsers }})</span>
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 shrink-0 rounded-sm" [style.background-color]="adsColor"></span>
              <span class="text-m3-body-md text-(--mat-sys-on-surface-variant)">
                {{ translationService.t('dashboard.newAds') }}
                <span class="ayar-num font-medium text-(--mat-sys-on-surface)" dir="ltr">({{ totalAds }})</span>
              </span>
            </div>
          </div>
        }

        @if (loading) {
          <div class="app-skeleton h-[300px] w-full animate-pulse"></div>
        } @else if (!visibleDaily.length) {
          <div class="flex h-[300px] items-center justify-center">
            <p class="text-(--mat-sys-on-surface-variant)">
              {{ translationService.t('dashboard.statsLoadError') }}
            </p>
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
      </mat-card-content>
    </mat-card>
  `,
})
export class ActivityChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() daily: StatsDailyPoint[] = [];
  @Input() loading = false;

  /** Weekly shows the last 7 days; monthly (default) the full 30-day series. */
  period: ActivityPeriod = 'monthly';

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
  colors: string[] = [USERS_LIGHT, ADS_LIGHT];
  usersColor = USERS_LIGHT;
  adsColor = ADS_LIGHT;

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

  get visibleDaily(): StatsDailyPoint[] {
    return this.period === 'weekly' ? this.daily.slice(-7) : this.daily;
  }

  get totalUsers(): number {
    return this.visibleDaily.reduce((sum, d) => sum + d.users, 0);
  }

  get totalAds(): number {
    return this.visibleDaily.reduce((sum, d) => sum + d.ads, 0);
  }

  setPeriod(period: ActivityPeriod) {
    if (this.period === period) return;
    this.period = period;
    this.rebuildChart();
  }

  rebuildChart() {
    const daily = this.visibleDaily;
    if (!daily.length) {
      this.series = [];
      return;
    }

    const isDark = this.themeService.currentTheme === 'dark';
    this.usersColor = isDark ? USERS_DARK : USERS_LIGHT;
    this.adsColor = isDark ? ADS_DARK : ADS_LIGHT;
    this.colors = [this.usersColor, this.adsColor];
    const isRTL = this.translationService.isRTL;
    const fontFamily = isRTL ? 'Cairo, sans-serif' : 'Outfit, sans-serif';
    const labelColor = isDark ? '#a8a29e' : '#94a3b8';
    const locale = isRTL ? 'ar-SA' : 'en-US';

    // `date` is already a Dubai calendar day; format it as UTC so the browser timezone can't shift it.
    const categories = daily.map((d) =>
      new Date(`${d.date}T00:00:00Z`).toLocaleDateString(locale, { month: 'short', day: 'numeric', timeZone: 'UTC' })
    );

    this.series = [
      { name: this.translationService.t('dashboard.newUsers'), data: daily.map((d) => d.users) },
      { name: this.translationService.t('dashboard.newAds'), data: daily.map((d) => d.ads) },
    ];

    this.chart = {
      type: 'bar',
      height: 300,
      fontFamily: 'Cairo, Outfit, sans-serif',
      toolbar: { show: false },
      animations: { enabled: true, speed: 400 },
    };

    this.plotOptions = {
      bar: { columnWidth: '55%', borderRadius: 3, borderRadiusApplication: 'end' },
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
