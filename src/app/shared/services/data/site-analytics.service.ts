import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../api/api-config.service';
import { ApiResponse } from './posts-ads.service';

export const SITE_ANALYTICS_RANGES = [7, 30, 90] as const;
export type SiteAnalyticsRange = (typeof SITE_ANALYTICS_RANGES)[number];

export interface SiteAnalyticsTotals {
  /** Sum of daily unique visitors (the visitor hash rotates every Dubai day). */
  visitors: number;
  pageViews: number;
  downloadClicks: number;
  ios: number;
  android: number;
  /** % of daily visitors who clicked at least one store button. */
  conversionRate: number;
}

/** One Dubai calendar day: `date` is YYYY-MM-DD. */
export interface SiteAnalyticsDailyPoint {
  date: string;
  visitors: number;
  pageViews: number;
  downloads: number;
}

export interface SiteAnalyticsPlacement {
  placement: string;
  ios: number;
  android: number;
  total: number;
}

export interface SiteAnalyticsOverview {
  days: SiteAnalyticsRange;
  totals: SiteAnalyticsTotals;
  daily: SiteAnalyticsDailyPoint[];
  downloadsByPlacement: SiteAnalyticsPlacement[];
  topPages: { path: string; views: number; visitors: number }[];
  devices: { mobile: number; tablet: number; desktop: number };
  topReferrers: { host: string; visits: number }[];
}

@Injectable({ providedIn: 'root' })
export class SiteAnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);

  getOverview(days: SiteAnalyticsRange): Observable<ApiResponse<SiteAnalyticsOverview>> {
    return this.http.get<ApiResponse<SiteAnalyticsOverview>>(
      `${this.apiConfig.getAdminSiteAnalyticsUrl()}/overview`,
      { params: new HttpParams().set('days', days) }
    );
  }
}
