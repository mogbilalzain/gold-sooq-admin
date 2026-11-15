import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, shareReplay, throwError } from 'rxjs';
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

  /**
   * 30-second cache so the sidebar badges and the dashboard home share a
   * single request instead of each firing their own.
   */
  private overviewCache$: Observable<ApiResponse<StatsOverview>> | null = null;
  private overviewCacheTime = 0;

  getOverview(): Observable<ApiResponse<StatsOverview>> {
    const now = Date.now();
    if (this.overviewCache$ && now - this.overviewCacheTime < 30_000) {
      return this.overviewCache$;
    }
    this.overviewCacheTime = now;
    this.overviewCache$ = this.http
      .get<ApiResponse<StatsOverview>>(`${this.apiConfig.getAdminStatsUrl()}/overview`)
      .pipe(
        // On failure drop the cache so the next call retries instead of
        // replaying the same error.
        catchError((err) => {
          this.overviewCache$ = null;
          this.overviewCacheTime = 0;
          return throwError(() => err);
        }),
        shareReplay(1)
      );
    return this.overviewCache$;
  }
}
