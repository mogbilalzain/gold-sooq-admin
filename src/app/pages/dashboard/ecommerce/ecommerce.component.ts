import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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

  identityIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.6-1.4 1.7-2 3-2s2.4.6 3 2M14.5 10H18M14.5 13H17"/></svg>';

  businessIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/></svg>';

  mailIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>';

  // Icon SVGs
  userIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM17.0246 18.8566V18.8455C17.0246 16.7744 15.3457 15.0955 13.2746 15.0955H10.7246C8.65354 15.0955 6.97461 16.7744 6.97461 18.8455V18.856C8.38223 19.8895 10.1198 20.5 12 20.5C13.8798 20.5 15.6171 19.8898 17.0246 18.8566ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12Z" fill="currentColor"></path></svg>';

  postIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 3.25C4.25736 3.25 3.25 4.25736 3.25 5.5V18.5C3.25 19.7426 4.25736 20.75 5.5 20.75H18.5C19.7426 20.75 20.75 19.7427 20.75 18.5V5.5C20.75 4.25736 19.7426 3.25 18.5 3.25H5.5ZM4.75 5.5C4.75 5.08579 5.08579 4.75 5.5 4.75H18.5C18.9142 4.75 19.25 5.08579 19.25 5.5V18.5C19.25 18.9142 18.9142 19.25 18.5 19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5V5.5ZM7.5 7.25C7.08579 7.25 6.75 7.58579 6.75 8C6.75 8.41421 7.08579 8.75 7.5 8.75H16.5C16.9142 8.75 17.25 8.41421 17.25 8C17.25 7.58579 16.9142 7.25 7.5 7.25H7.5ZM6.75 12C6.75 11.5858 7.08579 11.25 7.5 11.25H16.5C16.9142 11.25 17.25 11.5858 17.25 12C17.25 12.4142 16.9142 12.75 16.5 12.75H7.5C7.08579 12.75 6.75 12.4142 6.75 12ZM7.5 15.25C7.08579 15.25 6.75 15.5858 6.75 16C6.75 16.4142 7.08579 16.75 7.5 16.75H12.5C12.9142 16.75 13.25 16.4142 13.25 16C13.25 15.5858 12.9142 15.25 12.5 15.25H7.5Z" fill="currentColor"></path></svg>';

  activeIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM16.0303 8.96967C16.3232 9.26256 16.3232 9.73744 16.0303 10.0303L11.0303 15.0303C10.7374 15.3232 10.2626 15.3232 9.96967 15.0303L7.96967 13.0303C7.67678 12.7374 7.67678 12.2626 7.96967 11.9697C8.26256 11.6768 8.73744 11.6768 9.03033 11.9697L10.5 13.4393L14.9697 8.96967C15.2626 8.67678 15.7374 8.67678 16.0303 8.96967Z" fill="currentColor"></path></svg>';

  categoryIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.5 4.5C3.5 3.67157 4.17157 3 5 3H9C9.82843 3 10.5 3.67157 10.5 4.5V8.5C10.5 9.32843 9.82843 10 9 10H5C4.17157 10 3.5 9.32843 3.5 8.5V4.5ZM5 4.5V8.5H9V4.5H5ZM13.5 4.5C13.5 3.67157 14.1716 3 15 3H19C19.8284 3 20.5 3.67157 20.5 4.5V8.5C20.5 9.32843 19.8284 10 19 10H15C14.1716 10 13.5 8.5 13.5 4.5ZM15 4.5V8.5H19V4.5H15ZM3.5 15.5C3.5 14.6716 4.17157 14 5 14H9C9.82843 14 10.5 14.6716 10.5 15.5V19.5C10.5 20.3284 9.82843 21 9 21H5C4.17157 21 3.5 20.3284 3.5 19.5V15.5ZM5 15.5V19.5H9V15.5H5ZM13.5 15.5C13.5 14.6716 14.1716 14 15 14H19C19.8284 14 20.5 14.6716 20.5 15.5V19.5C20.5 20.3284 19.8284 21 19 21H15C14.1716 21 13.5 20.3284 13.5 19.5V15.5ZM15 15.5H19V15.5H15Z" fill="currentColor"></path></svg>';

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

  /** "5 من 16 إعلان نشط" / "5 of 16 ads active" — under the active-posts progress bar. */
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
    const warn = 'bg-warning-500/10 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400';
    return [
      {
        labelKey: 'dashboard.attentionAds',
        count: pending.ads,
        route: '/posts-ads',
        queryParams: { status: 'pending' },
        icon: this.postIcon,
        iconBgClass: warn,
      },
      {
        labelKey: 'dashboard.attentionIdentity',
        count: pending.identity,
        route: '/identity-requests',
        queryParams: { status: 'pending' },
        icon: this.identityIcon,
        iconBgClass: 'bg-[color:var(--color-primary-container)] text-[color:var(--color-on-primary-container)]',
      },
      {
        labelKey: 'dashboard.attentionBusiness',
        count: pending.business,
        route: '/business-requests',
        queryParams: { status: 'pending' },
        icon: this.businessIcon,
        iconBgClass: 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500',
      },
      {
        labelKey: 'dashboard.attentionContact',
        count: pending.contactMessages,
        route: '/contact-messages',
        queryParams: { status: 'new' },
        icon: this.mailIcon,
        iconBgClass: warn,
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

  /** "تحديث الأسعار": reloads the pulse series, the chart and the spot cards together. */
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
