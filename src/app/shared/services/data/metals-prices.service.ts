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

