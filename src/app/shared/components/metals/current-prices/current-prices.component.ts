import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslationService } from '../../../services/translation.service';
import { MetalsPricesService, CurrentPricesResponse } from '../../../services/data/metals-prices.service';
import { ErrorHandlerService } from '../../../services/api/error-handler.service';
import { LoadingSpinnerComponent } from '../../common/loading-spinner/loading-spinner.component';
import { SettingsService } from '../../../services/data/settings.service';

@Component({
  selector: 'app-current-prices',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './current-prices.component.html',
})
export class CurrentPricesComponent implements OnInit, OnChanges, OnDestroy {
  @Input() countryCode: string = 'AE';
  @Input() showTitle: boolean = true;
  @Input() autoRefresh: boolean = false;
  @Input() refreshInterval: number = 60000; // 1 minute default
  /** 'default' = metals prices page layout; 'spot' = dashboard home layout. */
  @Input() variant: 'default' | 'spot' = 'default';

  /** Karat keys of the gold by_carat map, in display order. */
  readonly karatKeys = ['24k', '22k', '21k', '18k', '14k'];

  currentPrices: CurrentPricesResponse | null = null;
  isLoading = false;
  errorMessage = '';

  private refreshTimer: any;

  constructor(
    public translationService: TranslationService,
    private metalsPricesService: MetalsPricesService,
    private errorHandler: ErrorHandlerService,
    public settingsService: SettingsService
  ) {}

  /** Narrowed accessors: keep the template null-safe under strictTemplates. */
  get metals() {
    return this.currentPrices?.metals ?? null;
  }

  get gold() {
    return this.currentPrices?.metals?.gold ?? null;
  }

  get silver() {
    return this.currentPrices?.metals?.silver ?? null;
  }

  get platinum() {
    return this.currentPrices?.metals?.platinum ?? null;
  }

  get timestamps() {
    return this.currentPrices?.timestamps ?? null;
  }

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
        // Tolerant check: a malformed/partial payload must not crash the template
        // (a throw here aborts the CD tick and freezes every component below this card).
        if (response.status === 'success' && response.data?.metals?.gold) {
          this.currentPrices = response.data;
        } else {
          this.currentPrices = null;
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

