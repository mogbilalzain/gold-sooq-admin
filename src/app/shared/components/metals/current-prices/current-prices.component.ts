import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../services/translation.service';
import { MetalsPricesService, CurrentPricesResponse } from '../../../services/data/metals-prices.service';
import { ErrorHandlerService } from '../../../services/api/error-handler.service';
import { LoadingSpinnerComponent } from '../../common/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-current-prices',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './current-prices.component.html',
})
export class CurrentPricesComponent implements OnInit, OnChanges, OnDestroy {
  @Input() countryCode: string = 'AE';
  @Input() showTitle: boolean = true;
  @Input() autoRefresh: boolean = false;
  @Input() refreshInterval: number = 60000; // 1 minute default

  currentPrices: CurrentPricesResponse | null = null;
  isLoading = false;
  errorMessage = '';

  private refreshTimer: any;

  constructor(
    public translationService: TranslationService,
    private metalsPricesService: MetalsPricesService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit() {
    this.loadCurrentPrices();
    
    if (this.autoRefresh) {
      this.startAutoRefresh();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['countryCode'] && !changes['countryCode'].firstChange) {
      this.loadCurrentPrices();
    }
  }

  ngOnDestroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

  loadCurrentPrices() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.metalsPricesService.getCurrentPrices({
      countryCode: this.countryCode
    }).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.currentPrices = response.data;
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

  private startAutoRefresh() {
    this.refreshTimer = setInterval(() => {
      this.loadCurrentPrices();
    }, this.refreshInterval);
  }

  refresh() {
    this.loadCurrentPrices();
  }
}

