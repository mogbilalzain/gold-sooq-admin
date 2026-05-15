import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../api/api-config.service';
import { ErrorHandlerService } from '../api/error-handler.service';

export interface ApiResponse<T> {
  message: string;
  status: string;
  data: T;
}

export interface MetalsPrice {
  gold: string;
  silver: string;
  platinum?: string;
  timestamp: string;
  country?: string;
  currency?: string;
}

export interface CurrentPricesRequest {
  countryCode: string;
}

export interface GoldPrices {
  usd_per_toz: number;
  local_per_toz: number;
  local_per_gram: number;
  by_carat: {
    '24k': number;
    '22k': number;
    '21k': number;
    '18k': number;
    '14k': number;
  };
}

export interface SilverPrices {
  usd_per_toz: number;
  local_per_toz: number;
  local_per_gram: number;
}

export interface PlatinumPrices {
  usd_per_toz: number;
  local_per_toz: number;
  local_per_gram: number;
}

export interface CurrentPricesResponse {
  country: string;
  currency: string;
  exchange_rate: number;
  metals: {
    gold: GoldPrices;
    silver: SilverPrices;
    platinum: PlatinumPrices;
  };
  timestamps: {
    metal: string;
    currency: string;
  };
  _meta: {
    source: string;
  };
}

export interface HistoricalPricesRequest {
  countryCode: string;
  period: '7d' | '1m' | '3m';
}

export interface HistoricalPrice {
  date: string;
  gold_usd: number;
  gold_local: number;
  silver_usd: number;
  silver_local: number;
  platinum_usd?: number;
  platinum_local?: number;
}

export interface HistoricalPricesResponse {
  country: string;
  currency: string;
  period: string;
  start_date: string;
  end_date: string;
  rates: { [date: string]: HistoricalPrice };
  _meta: {
    source: string;
    total_days: number;
  };
}

export interface DailyNotificationPreview {
  gold: string;
  silver: string;
  timestamp: string;
  cache_source: string;
  preview: {
    title_en: string;
    title_ar: string;
    message_en: string;
    message_ar: string;
  };
}

export interface DailyNotificationSchedule {
  schedule: string;
  cron_expression: string;
  topics: {
    english: string;
    arabic: string;
  };
  data_source: string;
  database_save: boolean;
}

export interface TriggerNotificationResponse {
  success: boolean;
  goldPrice: string;
  silverPrice: string;
  timestamp: string;
  topics_sent: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MetalsPricesService {

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private errorHandler: ErrorHandlerService
  ) {}

  getLatestPrices(): Observable<ApiResponse<MetalsPrice>> {
    return this.http.get<ApiResponse<MetalsPrice>>(
      `${this.apiConfig.getAdminMetalsPricesUrl()}/latest`
    );
  }

  getCurrentPrices(request: CurrentPricesRequest): Observable<ApiResponse<CurrentPricesResponse>> {
    return this.http.post<ApiResponse<CurrentPricesResponse>>(
      `${this.apiConfig.getBaseUrl()}/metals-prices/getCurrentPrices`,
      request
    );
  }

  getHistoricalPrices(request: HistoricalPricesRequest): Observable<ApiResponse<HistoricalPricesResponse>> {
    return this.http.post<ApiResponse<HistoricalPricesResponse>>(
      `${this.apiConfig.getBaseUrl()}/metals-prices/getHistoricalPrices`,
      request
    );
  }

  triggerDailyNotification(): Observable<ApiResponse<TriggerNotificationResponse>> {
    return this.http.post<ApiResponse<TriggerNotificationResponse>>(
      `${this.apiConfig.getAdminMetalsPricesUrl()}/daily-notifications/trigger`,
      {}
    );
  }

  getDailyNotificationPreview(): Observable<ApiResponse<DailyNotificationPreview>> {
    return this.http.get<ApiResponse<DailyNotificationPreview>>(
      `${this.apiConfig.getAdminMetalsPricesUrl()}/daily-notifications/preview`
    );
  }

  getDailyNotificationSchedule(): Observable<ApiResponse<DailyNotificationSchedule>> {
    return this.http.get<ApiResponse<DailyNotificationSchedule>>(
      `${this.apiConfig.getAdminMetalsPricesUrl()}/daily-notifications/schedule`
    );
  }
}

