import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatChipsModule, MatChipSelectionChange } from '@angular/material/chips';
import { PageHeaderComponent } from '../../shared/components/layout/page-header/page-header.component';
import { StatsCardComponent } from '../../shared/components/common/stats-card/stats-card.component';
import { SiteVisitsChartComponent } from '../../shared/components/charts/site-visits-chart/site-visits-chart.component';
import { TranslationService } from '../../shared/services/translation.service';
import { ErrorHandlerService } from '../../shared/services/api/error-handler.service';
import {
  SITE_ANALYTICS_RANGES,
  SiteAnalyticsOverview,
  SiteAnalyticsRange,
  SiteAnalyticsService,
} from '../../shared/services/data/site-analytics.service';

const DEVICE_KEYS = ['mobile', 'tablet', 'desktop'] as const;

/** Anonymous ayarsouq.com visits and app-download clicks. */
@Component({
  selector: 'app-site-analytics',
  standalone: true,
  imports: [CommonModule, MatChipsModule, PageHeaderComponent, StatsCardComponent, SiteVisitsChartComponent],
  template: `
    <app-page-header
      [title]="translationService.t('siteAnalytics.title')"
      [subtitle]="translationService.t('siteAnalytics.subtitle')">
    </app-page-header>

    <div class="space-y-6">
      <div class="modern-card !p-4 md:!p-5 flex flex-wrap items-center gap-3">
        <mat-chip-listbox hideSingleSelectionIndicator [attr.aria-label]="translationService.t('siteAnalytics.title')">
          @for (range of ranges; track range) {
            <mat-chip-option [selected]="days() === range" (selectionChange)="pickRange($event, range)">
              {{ rangeLabel(range) }}
            </mat-chip-option>
          }
        </mat-chip-listbox>
        <p class="ms-auto text-xs text-surface-on-surface-variant">
          {{ translationService.t('siteAnalytics.privacyNote') }}
        </p>
      </div>

      @if (errorMessage()) {
        <div class="p-3 text-sm rounded-xl status-pill-error">{{ errorMessage() }}</div>
      }

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        <app-stats-card
          [title]="translationService.t('siteAnalytics.visitors')"
          [value]="data()?.totals?.visitors ?? 0"
          [suffix]="translationService.t('siteAnalytics.visitorsHint')"
          [icon]="visitorsIcon"
        ></app-stats-card>
        <app-stats-card
          [title]="translationService.t('siteAnalytics.pageViews')"
          [value]="data()?.totals?.pageViews ?? 0"
          [icon]="pageViewsIcon"
          iconBgClass="bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500"
        ></app-stats-card>
        <app-stats-card
          [title]="translationService.t('siteAnalytics.downloadClicks')"
          [value]="data()?.totals?.downloadClicks ?? 0"
          [icon]="downloadIcon"
          iconBgClass="bg-warning-500/10 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400"
        ></app-stats-card>
        <app-stats-card
          [title]="translationService.t('siteAnalytics.conversionRate')"
          [value]="data()?.totals?.conversionRate ?? 0"
          [suffix]="'% ' + translationService.t('siteAnalytics.conversionHint')"
          [icon]="conversionIcon"
        ></app-stats-card>
      </div>

      <app-site-visits-chart class="block" [daily]="data()?.daily ?? []" [loading]="loading()"></app-site-visits-chart>

      <div class="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2">
        <section class="modern-card !p-5 md:!p-6">
          <h3 class="text-m3-title-lg font-medium text-surface-on-surface mb-4">
            {{ translationService.t('siteAnalytics.downloadsByStore') }}
          </h3>
          @if (data()?.totals?.downloadClicks) {
            <div class="space-y-3 mb-6">
              @for (store of stores(); track store.label) {
                <div>
                  <div class="flex items-center gap-2 text-sm mb-1">
                    <span class="text-surface-on-surface">{{ store.label }}</span>
                    <span class="ms-auto font-semibold text-surface-on-surface">{{ store.value | number }}</span>
                  </div>
                  <div class="h-2 rounded-full bg-surface-container-high overflow-hidden">
                    <div class="h-full rounded-full" [style.width.%]="store.percent" [style.background-color]="store.color"></div>
                  </div>
                </div>
              }
            </div>

            <h4 class="text-m3-title-md font-medium text-surface-on-surface mb-2">
              {{ translationService.t('siteAnalytics.downloadsByPlacement') }}
            </h4>
            <table class="w-full text-sm">
              <thead>
                <tr class="text-surface-on-surface-variant">
                  <th class="py-2 text-start font-medium"></th>
                  <th class="py-2 text-end font-medium">App Store</th>
                  <th class="py-2 text-end font-medium">Google Play</th>
                  <th class="py-2 text-end font-medium">{{ translationService.t('siteAnalytics.clicks') }}</th>
                </tr>
              </thead>
              <tbody>
                @for (row of data()!.downloadsByPlacement; track row.placement) {
                  <tr class="border-t border-outline-variant/40">
                    <td class="py-2 text-surface-on-surface">{{ placementLabel(row.placement) }}</td>
                    <td class="py-2 text-end">{{ row.ios | number }}</td>
                    <td class="py-2 text-end">{{ row.android | number }}</td>
                    <td class="py-2 text-end font-semibold">{{ row.total | number }}</td>
                  </tr>
                }
              </tbody>
            </table>
          } @else {
            <p class="py-6 text-center text-surface-on-surface-variant">{{ emptyText() }}</p>
          }
        </section>

        <section class="modern-card !p-5 md:!p-6">
          <h3 class="text-m3-title-lg font-medium text-surface-on-surface mb-4">
            {{ translationService.t('siteAnalytics.devices') }}
          </h3>
          @if (deviceTotal()) {
            <div class="space-y-3">
              @for (device of devices(); track device.key) {
                <div>
                  <div class="flex items-center gap-2 text-sm mb-1">
                    <span class="text-surface-on-surface">{{ translationService.t('siteAnalytics.deviceTypes.' + device.key) }}</span>
                    <span class="ms-auto text-surface-on-surface-variant">{{ device.percent | number: '1.0-0' }}%</span>
                    <span class="w-12 text-end font-semibold text-surface-on-surface">{{ device.value | number }}</span>
                  </div>
                  <div class="h-2 rounded-full bg-surface-container-high overflow-hidden">
                    <div class="h-full rounded-full bg-[color:var(--color-primary)]" [style.width.%]="device.percent"></div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <p class="py-6 text-center text-surface-on-surface-variant">{{ emptyText() }}</p>
          }
        </section>
      </div>

      <div class="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2">
        <section class="modern-card !p-5 md:!p-6">
          <h3 class="text-m3-title-lg font-medium text-surface-on-surface mb-4">
            {{ translationService.t('siteAnalytics.topPages') }}
          </h3>
          @if (data()?.topPages?.length) {
            <table class="w-full text-sm">
              <thead>
                <tr class="text-surface-on-surface-variant">
                  <th class="py-2 text-start font-medium">{{ translationService.t('siteAnalytics.page') }}</th>
                  <th class="py-2 text-end font-medium">{{ translationService.t('siteAnalytics.views') }}</th>
                  <th class="py-2 text-end font-medium">{{ translationService.t('siteAnalytics.visitors') }}</th>
                </tr>
              </thead>
              <tbody>
                @for (page of data()!.topPages; track page.path) {
                  <tr class="border-t border-outline-variant/40">
                    <td class="py-2 text-surface-on-surface" dir="ltr" [class.text-end]="translationService.isRTL">{{ page.path }}</td>
                    <td class="py-2 text-end font-semibold">{{ page.views | number }}</td>
                    <td class="py-2 text-end">{{ page.visitors | number }}</td>
                  </tr>
                }
              </tbody>
            </table>
          } @else {
            <p class="py-6 text-center text-surface-on-surface-variant">{{ emptyText() }}</p>
          }
        </section>

        <section class="modern-card !p-5 md:!p-6">
          <h3 class="text-m3-title-lg font-medium text-surface-on-surface mb-4">
            {{ translationService.t('siteAnalytics.topReferrers') }}
          </h3>
          @if (data()?.topReferrers?.length) {
            <table class="w-full text-sm">
              <tbody>
                @for (ref of data()!.topReferrers; track ref.host) {
                  <tr class="border-t border-outline-variant/40 first:border-t-0">
                    <td class="py-2 text-surface-on-surface" dir="ltr" [class.text-end]="translationService.isRTL">{{ ref.host }}</td>
                    <td class="py-2 text-end font-semibold">{{ ref.visits | number }}</td>
                  </tr>
                }
              </tbody>
            </table>
          } @else {
            <p class="py-6 text-center text-surface-on-surface-variant">{{ emptyText() }}</p>
          }
        </section>
      </div>
    </div>
  `,
})
export class SiteAnalyticsComponent implements OnInit {
  readonly translationService = inject(TranslationService);
  private readonly siteAnalytics = inject(SiteAnalyticsService);
  private readonly errorHandler = inject(ErrorHandlerService);

  readonly ranges = SITE_ANALYTICS_RANGES;
  readonly days = signal<SiteAnalyticsRange>(30);
  readonly data = signal<SiteAnalyticsOverview | null>(null);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly stores = computed(() => {
    const totals = this.data()?.totals;
    const total = totals?.downloadClicks || 1;
    return [
      { label: 'App Store', value: totals?.ios ?? 0, percent: ((totals?.ios ?? 0) / total) * 100, color: '#5b8def' },
      { label: 'Google Play', value: totals?.android ?? 0, percent: ((totals?.android ?? 0) / total) * 100, color: '#d4af37' },
    ];
  });

  readonly deviceTotal = computed(() => {
    const devices = this.data()?.devices;
    return devices ? DEVICE_KEYS.reduce((sum, key) => sum + devices[key], 0) : 0;
  });

  readonly devices = computed(() => {
    const devices = this.data()?.devices;
    const total = this.deviceTotal() || 1;
    return DEVICE_KEYS.map((key) => ({ key, value: devices?.[key] ?? 0, percent: ((devices?.[key] ?? 0) / total) * 100 }));
  });

  readonly visitorsIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" fill="currentColor"/></svg>`;
  readonly pageViewsIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 5C6.5 5 2.73 9.11 1.5 12c1.23 2.89 5 7 10.5 7s9.27-4.11 10.5-7C21.27 9.11 17.5 5 12 5Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" fill="currentColor"/></svg>`;
  readonly downloadIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M11 3h2v9.17l3.59-3.58L18 10l-6 6-6-6 1.41-1.41L11 12.17V3Zm-6 15h14v2H5v-2Z" fill="currentColor"/></svg>`;
  readonly conversionIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 17.25 9 11.25l4 4L21 7.25V12h2V4h-8v2h4.59L13 12.59l-4-4-7.41 7.41L3 17.25Z" fill="currentColor"/></svg>`;

  ngOnInit(): void {
    this.load();
  }

  rangeLabel(range: SiteAnalyticsRange): string {
    return this.translationService.t('siteAnalytics.rangeDays').replace('{n}', String(range));
  }

  placementLabel(placement: string): string {
    const known = this.translationService.getTranslations().siteAnalytics.placements;
    return known[placement] ?? placement;
  }

  emptyText(): string {
    return this.translationService.t(this.loading() ? 'common.loading' : 'siteAnalytics.noData');
  }

  pickRange(event: MatChipSelectionChange, range: SiteAnalyticsRange): void {
    if (!event.selected) {
      event.source.select();
      return;
    }
    if (this.days() !== range) {
      this.days.set(range);
      this.load();
    }
  }

  private load(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.siteAnalytics.getOverview(this.days()).subscribe({
      next: (res) => {
        this.data.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(this.errorHandler.handleError(err).message || this.translationService.t('siteAnalytics.loadError'));
        this.loading.set(false);
      },
    });
  }
}
