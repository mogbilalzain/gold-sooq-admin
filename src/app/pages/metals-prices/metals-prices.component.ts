import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../shared/components/common/loading-spinner/loading-spinner.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { ConfirmDialogComponent } from '../../shared/components/common/confirm-dialog/confirm-dialog.component';
import { MetalsPricesChartComponent } from '../../shared/components/charts/metals-prices-chart/metals-prices-chart.component';
import { CurrentPricesComponent } from '../../shared/components/metals/current-prices/current-prices.component';
import { TranslationService } from '../../shared/services/translation.service';
import {
  MetalsPricesService,
  CurrentPricesResponse,
  HistoricalPrice,
  DailyNotificationPreview,
  DailyNotificationSchedule,
} from '../../shared/services/data/metals-prices.service';
import { MetalsPriceData } from '../../shared/components/charts/metals-prices-chart/metals-prices-chart.component';
import { ErrorHandlerService } from '../../shared/services/api/error-handler.service';
import { SettingsService } from '../../shared/services/data/settings.service';
import { NotifyService } from '../../shared/services/notify.service';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule, MatChipSelectionChange } from '@angular/material/chips';

@Component({
  selector: 'app-metals-prices',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    ButtonComponent,
    ConfirmDialogComponent,
    MetalsPricesChartComponent,
    CurrentPricesComponent,
    MatTableModule,
    MatChipsModule,
  ],
  templateUrl: './metals-prices.component.html',
})
export class MetalsPricesComponent implements OnInit {
  latestPrices: CurrentPricesResponse | null = null;
  historicalPrices: HistoricalPrice[] = [];
  historicalData: any = null;
  chartData: MetalsPriceData[] = [];
  isLoading = false;
  isTriggering = false;
  errorMessage = '';

  notificationPreview: DailyNotificationPreview | null = null;
  notificationSchedule: DailyNotificationSchedule | null = null;
  triggerDialogOpen = false;

  selectedPeriod: '7d' | '1m' | '3m' = '7d';
  countryCode = 'AE'; // Default country code
  /** True when 3m was rejected by the server and we fell back to 1m. */
  periodFallback = false;

  /** Platinum column appears only when the feed returns platinum values. */
  get historicalColumns(): string[] {
    const hasPlatinum = this.historicalPrices.length > 0 && !!this.historicalPrices[0].platinum_local;
    return hasPlatinum ? ['date', 'gold', 'silver', 'platinum'] : ['date', 'gold', 'silver'];
  }

  constructor(
    public translationService: TranslationService,
    private metalsPricesService: MetalsPricesService,
    private errorHandler: ErrorHandlerService,
    public settingsService: SettingsService,
    private notify: NotifyService
  ) {}

  ngOnInit() {
    this.loadLatestPrices();
    this.loadHistoricalPrices();
    this.loadNotificationPreview();
    this.loadNotificationSchedule();
  }

  loadNotificationPreview() {
    this.metalsPricesService.getDailyNotificationPreview().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.notificationPreview = response.data;
        }
      },
      error: () => { /* Preview is non-critical; ignore load failures. */ }
    });
  }

  loadNotificationSchedule() {
    this.metalsPricesService.getDailyNotificationSchedule().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.notificationSchedule = response.data;
        }
      },
      error: () => { /* Schedule is non-critical; ignore load failures. */ }
    });
  }

  loadLatestPrices() {
    this.isLoading = true;
    this.metalsPricesService.getLatestPrices(this.countryCode).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.latestPrices = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        const apiError = this.errorHandler.handleError(error);
        this.errorMessage = apiError.message;
        this.isLoading = false;
      }
    });
  }

  loadHistoricalPrices() {
    this.metalsPricesService.getHistoricalPrices({
      countryCode: this.countryCode,
      period: this.selectedPeriod
    }).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.historicalData = response.data;
          // Convert rates object to array
          this.historicalPrices = Object.values(response.data.rates || {}).map((rate: any) => ({
            date: rate.date,
            gold_usd: rate.gold_usd,
            gold_local: rate.gold_local,
            silver_usd: rate.silver_usd,
            silver_local: rate.silver_local,
            platinum_usd: rate.platinum_usd,
            platinum_local: rate.platinum_local,
          }));
          // Sort by date descending for table
          this.historicalPrices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          // Prepare chart data (sorted ascending for chart)
          this.chartData = this.historicalPrices.map(price => ({
            date: price.date,
            gold_local: price.gold_local,
            silver_local: price.silver_local,
            platinum_local: price.platinum_local,
          })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }
      },
      error: (error) => {
        // The live API currently rejects 3m with a 400 — fall back to 1 month once.
        if (this.selectedPeriod === '3m' && error?.status >= 400 && error?.status < 500) {
          this.selectedPeriod = '1m';
          this.periodFallback = true;
          this.loadHistoricalPrices();
          return;
        }
        console.error('Error loading historical prices:', error);
      }
    });
  }

  onPeriodChange(period: '7d' | '1m' | '3m') {
    // Ignore programmatic selection echoes (e.g. after the 3m -> 1m fallback
    // switches the selected chip) so the fallback notice stays visible and no
    // redundant reload is triggered.
    if (this.selectedPeriod === period) {
      return;
    }
    this.selectedPeriod = period;
    this.periodFallback = false;
    this.loadHistoricalPrices();
  }

  /** Single-select chip group: re-select the chip if the user clicks the active one. */
  pickPeriod(event: MatChipSelectionChange, period: '7d' | '1m' | '3m') {
    if (event.selected) {
      this.onPeriodChange(period);
    } else {
      event.source.select();
    }
  }

  openTriggerDialog() {
    this.triggerDialogOpen = true;
  }

  cancelTrigger() {
    if (this.isTriggering) return;
    this.triggerDialogOpen = false;
  }

  confirmTrigger() {
    this.isTriggering = true;
    this.errorMessage = '';
    this.metalsPricesService.triggerDailyNotification().subscribe({
      next: (response) => {
        this.isTriggering = false;
        this.triggerDialogOpen = false;
        if (response.status === 'success') {
          const sent = response.data?.topics_sent?.length ?? 0;
          this.notify.success(
            sent > 0
              ? `${this.translationService.t('metals.notificationSent')} (${sent})`
              : this.translationService.t('metals.notificationSent')
          );
        }
      },
      error: (error) => {
        this.isTriggering = false;
        this.triggerDialogOpen = false;
        this.errorMessage = this.errorHandler.handleError(error).message;
      }
    });
  }
}

