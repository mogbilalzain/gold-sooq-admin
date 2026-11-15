import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { KpiCardComponent } from '../../../shared/components/dashboard/kpi-card/kpi-card.component';
import { TranslationService } from '../../../shared/services/translation.service';
import { PostsAdsService, PostAd } from '../../../shared/services/data/posts-ads.service';
import { StatsService, StatsDailyPoint, StatsPending } from '../../../shared/services/data/stats.service';
import { MetalsPricesService } from '../../../shared/services/data/metals-prices.service';
import { MetalsPriceData } from '../../../shared/components/charts/metals-prices-chart/metals-prices-chart.component';
import { GoldPriceChartComponent } from '../../../shared/components/charts/gold-price-chart/gold-price-chart.component';
import { CurrentPricesComponent } from '../../../shared/components/metals/current-prices/current-prices.component';
import { PricePulseComponent } from '../../../shared/components/dashboard/price-pulse/price-pulse.component';
import { PendingReviewComponent } from '../../../shared/components/dashboard/pending-review/pending-review.component';
import { RecentPostsComponent } from '../../../shared/components/dashboard/recent-posts/recent-posts.component';
import { SettingsService } from '../../../shared/services/data/settings.service';
import { ActivityChartComponent } from '../../../shared/components/charts/activity-chart/activity-chart.component';
import { WelcomeBannerComponent } from '../../../shared/components/dashboard/welcome-banner/welcome-banner.component';
import {
  AttentionListComponent,
  AttentionItem,
} from '../../../shared/components/dashboard/attention-list/attention-list.component';

@Component({
  selector: 'app-ecommerce',
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    KpiCardComponent,
    GoldPriceChartComponent,
    ActivityChartComponent,
    CurrentPricesComponent,
    PricePulseComponent,
    PendingReviewComponent,
    RecentPostsComponent,
    WelcomeBannerComponent,
    AttentionListComponent,
  ],
  templateUrl: './ecommerce.component.html',
})
export class EcommerceComponent implements OnInit {
  isLoading = true;
  loadingPosts = true;
  loadingPending = true;
  stats = {
    totalUsers: 0,
    totalPosts: 0,
    totalCategories: 0,
    activePosts: 0,
  };
  pending: StatsPending | null = null;
  daily: StatsDailyPoint[] = [];
  attentionItems: AttentionItem[] = [];
  metalsPricesData: MetalsPriceData[] = [];
  metalsCurrency = 'AED';
  recentPosts: PostAd[] = [];
  pendingPosts: PostAd[] = [];
  recentPage = 1;
  recentTotal = 0;
  readonly recentLimit = 5;
  refreshingMarket = false;

  @ViewChild('goldChart') private goldChart?: GoldPriceChartComponent;
  @ViewChild('currentPrices') private currentPrices?: CurrentPricesComponent;








  constructor(
    public translationService: TranslationService,
    private postsAdsService: PostsAdsService,
    private statsService: StatsService,
    private metalsPricesService: MetalsPricesService,
    public settingsService: SettingsService
  ) {}

  ngOnInit() {
    this.loadDashboardStats();
    this.loadMetalsPrices();
    this.loadRecentPosts();
    this.loadPendingPosts();
  }

  /** Open tasks across all queues, shown in the welcome banner summary. */
  get pendingTotal(): number {
    if (!this.pending) return 0;
    return (
      (this.pending.ads || 0) +
      (this.pending.identity || 0) +
      (this.pending.business || 0) +
      (this.pending.contactMessages || 0)
    );
  }

  get userTrend(): number[] {
    return this.daily.map((d) => d.users);
  }

  get adTrend(): number[] {
    return this.daily.map((d) => d.ads);
  }

  get newUsers30(): number {
    return this.daily.reduce((sum, d) => sum + d.users, 0);
  }

  get newAds30(): number {
    return this.daily.reduce((sum, d) => sum + d.ads, 0);
  }

  get activePostsPercent(): number {
    if (!this.stats.totalPosts) return 0;
    return (this.stats.activePosts / this.stats.totalPosts) * 100;
  }

  /** "5 Ù…Ù† 16 Ø¥Ø¹Ù„Ø§Ù† Ù†Ø´Ø·" / "5 of 16 ads active" â€” under the active-posts progress bar. */
  get activePostsLabel(): string {
    const t = (k: string) => this.translationService.t(k);
    return `${this.stats.activePosts} ${t('common.of')} ${this.stats.totalPosts} ${t('dashboard.adsUnit')} ${t('dashboard.activeShort')}`;
  }

  loadDashboardStats() {
    this.isLoading = true;

    this.statsService.getOverview().subscribe({
      next: (response) => {
        const data = response.data;
        if (data) {
          this.stats.totalUsers = data.totals.users;
          this.stats.totalPosts = data.totals.posts;
          this.stats.activePosts = data.totals.activePosts;
          this.stats.totalCategories = data.totals.categories;
          this.pending = data.pending;
          this.daily = data.daily || [];
          this.attentionItems = this.buildAttentionItems(data.pending);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.isLoading = false;
      },
    });
  }

  private buildAttentionItems(pending: StatsPending): AttentionItem[] {
    return [
      {
        labelKey: 'dashboard.attentionAds',
        count: pending.ads,
        route: '/posts-ads',
        queryParams: { status: 'pending' },
        icon: 'article',
      },
      {
        labelKey: 'dashboard.attentionIdentity',
        count: pending.identity,
        route: '/identity-requests',
        queryParams: { status: 'pending' },
        icon: 'badge',
      },
      {
        labelKey: 'dashboard.attentionBusiness',
        count: pending.business,
        route: '/business-requests',
        queryParams: { status: 'pending' },
        icon: 'storefront',
      },
      {
        labelKey: 'dashboard.attentionContact',
        count: pending.contactMessages,
        route: '/contact-messages',
        queryParams: { status: 'new' },
        icon: 'mail',
      },
    ];
  }

  loadPendingPosts() {
    this.loadingPending = true;
    const langCode = this.translationService.currentLanguageValue;

    this.postsAdsService.listPosts({ page: 1, limit: 5, langCode, status: 'pending' }).subscribe({
      next: (response) => {
        this.pendingPosts = response.data?.posts || [];
        this.loadingPending = false;
      },
      error: (error) => {
        console.error('Error loading pending posts:', error);
        this.loadingPending = false;
      },
    });
  }

  loadMetalsPrices() {
    this.refreshingMarket = true;
    this.metalsPricesService.getHistoricalPrices({
      countryCode: 'AE',
      period: '1m'
    }).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.metalsCurrency = response.data.currency || this.settingsService.currency;
          // Convert rates object to array
          this.metalsPricesData = Object.values(response.data.rates || {}).map((rate: any) => ({
            date: rate.date,
            gold_local: rate.gold_local,
            silver_local: rate.silver_local,
            platinum_local: rate.platinum_local,
          }));
          // Sort by date ascending for chart
          this.metalsPricesData.sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
        }
        this.refreshingMarket = false;
      },
      error: (error) => {
        console.error('Error loading metals prices:', error);
        this.refreshingMarket = false;
      }
    });
  }

  /** "ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø£Ø³Ø¹Ø§Ø±": reloads the pulse series, the chart and the spot cards together. */
  refreshMarket() {
    this.loadMetalsPrices();
    this.goldChart?.reload();
    this.currentPrices?.refresh();
  }

  loadRecentPosts(page: number = this.recentPage) {
    this.loadingPosts = true;
    this.recentPage = page;
    const langCode = this.translationService.currentLanguageValue;

    this.postsAdsService
      .listPosts({ page, limit: this.recentLimit, langCode, status: 'all' })
      .subscribe({
        next: (response) => {
          this.recentPosts = response.data?.posts || [];
          this.recentTotal = response.data?.pagination?.total ?? this.recentPosts.length;
          this.loadingPosts = false;
        },
        error: (error) => {
          console.error('Error loading recent posts:', error);
          this.loadingPosts = false;
        },
      });
  }

  /** Recent-ads table pagination. */
  onRecentPage(page: number) {
    this.loadRecentPosts(page);
  }
}
