import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../api/api-config.service';
import { ApiResponse } from './posts-ads.service';

export interface StatsPending {
  ads: number;
  identity: number;
  business: number;
  contactMessages: number;
}

export interface StatsTotals {
  users: number;
  posts: number;
  activePosts: number;
  categories: number;
}

/** One Dubai calendar day: `date` is YYYY-MM-DD. */
export interface StatsDailyPoint {
  date: string;
  users: number;
  ads: number;
}

export interface StatsOverview {
  pending: StatsPending;
  totals: StatsTotals;
  daily: StatsDailyPoint[];
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);

  getOverview(): Observable<ApiResponse<StatsOverview>> {
    return this.http.get<ApiResponse<StatsOverview>>(`${this.apiConfig.getAdminStatsUrl()}/overview`);
  }
}
