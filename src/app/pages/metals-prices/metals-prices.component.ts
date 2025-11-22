import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../shared/components/common/loading-spinner/loading-spinner.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { MetalsPricesChartComponent } from '../../shared/components/charts/metals-prices-chart/metals-prices-chart.component';
import { TranslationService } from '../../shared/services/translation.service';
import { MetalsPricesService, MetalsPrice, HistoricalPrice } from '../../shared/services/data/metals-prices.service';
import { MetalsPriceData } from '../../shared/components/charts/metals-prices-chart/metals-prices-chart.component';
import { ErrorHandlerService } from '../../shared/services/api/error-handler.service';

@Component({
  selector: 'app-metals-prices',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    ButtonComponent,
    MetalsPricesChartComponent,
  ],
  templateUrl: './metals-prices.component.html',
})
export class MetalsPricesComponent implements OnInit {
  latestPrices: MetalsPrice | null = null;
  historicalPrices: HistoricalPrice[] = [];
  historicalData: any = null;
  chartData: MetalsPriceData[] = [];
  isLoading = false;
  isTriggering = false;
  errorMessage = '';
  
  selectedPeriod: '7d' | '1m' | '3m' = '7d';
  countryCode = 'AE'; // Default country code

  constructor(
    public translationService: TranslationService,
    private metalsPricesService: MetalsPricesService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit() {
    this.loadLatestPrices();
    this.loadHistoricalPrices();
  }

  loadLatestPrices() {
    this.isLoading = true;
    this.metalsPricesService.getLatestPrices().subscribe({
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
        console.error('Error loading historical prices:', error);
      }
    });
  }

  onPeriodChange(period: '7d' | '1m' | '3m') {
    this.selectedPeriod = period;
    this.loadHistoricalPrices();
  }

  triggerDailyNotification() {
    if (confirm(this.translationService.t('metals.confirmTrigger'))) {
      this.isTriggering = true;
      this.metalsPricesService.triggerDailyNotification().subscribe({
        next: (response) => {
          if (response.status === 'success') {
            alert(this.translationService.t('metals.notificationSent'));
          }
          this.isTriggering = false;
        },
        error: (error) => {
          const apiError = this.errorHandler.handleError(error);
          alert(apiError.message);
          this.isTriggering = false;
        }
      });
    }
  }
}

