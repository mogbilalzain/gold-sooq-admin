import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EcommerceMetricsComponent } from '../../../shared/components/ecommerce/ecommerce-metrics/ecommerce-metrics.component';
import { MonthlySalesChartComponent } from '../../../shared/components/ecommerce/monthly-sales-chart/monthly-sales-chart.component';
import { MonthlyTargetComponent } from '../../../shared/components/ecommerce/monthly-target/monthly-target.component';
import { StatisticsChartComponent } from '../../../shared/components/ecommerce/statics-chart/statics-chart.component';
import { DemographicCardComponent } from '../../../shared/components/ecommerce/demographic-card/demographic-card.component';
import { RecentOrdersComponent } from '../../../shared/components/ecommerce/recent-orders/recent-orders.component';
import { StatsCardComponent } from '../../../shared/components/common/stats-card/stats-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/common/loading-spinner/loading-spinner.component';
import { TranslationService } from '../../../shared/services/translation.service';
import { UsersService } from '../../../shared/services/data/users.service';
import { PostsAdsService } from '../../../shared/services/data/posts-ads.service';
import { CategoriesService } from '../../../shared/services/data/categories.service';
import { MetalsPricesService, HistoricalPrice } from '../../../shared/services/data/metals-prices.service';
import { MetalsPricesChartComponent, MetalsPriceData } from '../../../shared/components/charts/metals-prices-chart/metals-prices-chart.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-ecommerce',
  imports: [
    CommonModule,
    EcommerceMetricsComponent,
    MonthlySalesChartComponent,
    MonthlyTargetComponent,
    StatisticsChartComponent,
    DemographicCardComponent,
    RecentOrdersComponent,
    StatsCardComponent,
    LoadingSpinnerComponent,
    MetalsPricesChartComponent,
  ],
  templateUrl: './ecommerce.component.html',
})
export class EcommerceComponent implements OnInit {
  isLoading = true;
  stats = {
    totalUsers: 0,
    totalPosts: 0,
    totalCategories: 0,
    activePosts: 0,
  };
  metalsPricesData: MetalsPriceData[] = [];
  metalsCurrency = 'AED';

  // Icon SVGs
  userIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM17.0246 18.8566V18.8455C17.0246 16.7744 15.3457 15.0955 13.2746 15.0955H10.7246C8.65354 15.0955 6.97461 16.7744 6.97461 18.8455V18.856C8.38223 19.8895 10.1198 20.5 12 20.5C13.8798 20.5 15.6171 19.8898 17.0246 18.8566ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12Z" fill="currentColor"></path></svg>';
  
  postIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 3.25C4.25736 3.25 3.25 4.25736 3.25 5.5V18.5C3.25 19.7426 4.25736 20.75 5.5 20.75H18.5C19.7426 20.75 20.75 19.7427 20.75 18.5V5.5C20.75 4.25736 19.7426 3.25 18.5 3.25H5.5ZM4.75 5.5C4.75 5.08579 5.08579 4.75 5.5 4.75H18.5C18.9142 4.75 19.25 5.08579 19.25 5.5V18.5C19.25 18.9142 18.9142 19.25 18.5 19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5V5.5ZM7.5 7.25C7.08579 7.25 6.75 7.58579 6.75 8C6.75 8.41421 7.08579 8.75 7.5 8.75H16.5C16.9142 8.75 17.25 8.41421 17.25 8C17.25 7.58579 16.9142 7.25 16.5 7.25H7.5ZM6.75 12C6.75 11.5858 7.08579 11.25 7.5 11.25H16.5C16.9142 11.25 17.25 11.5858 17.25 12C17.25 12.4142 16.9142 12.75 16.5 12.75H7.5C7.08579 12.75 6.75 12.4142 6.75 12ZM7.5 15.25C7.08579 15.25 6.75 15.5858 6.75 16C6.75 16.4142 7.08579 16.75 7.5 16.75H12.5C12.9142 16.75 13.25 16.4142 13.25 16C13.25 15.5858 12.9142 15.25 12.5 15.25H7.5Z" fill="currentColor"></path></svg>';
  
  activeIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM16.0303 8.96967C16.3232 9.26256 16.3232 9.73744 16.0303 10.0303L11.0303 15.0303C10.7374 15.3232 10.2626 15.3232 9.96967 15.0303L7.96967 13.0303C7.67678 12.7374 7.67678 12.2626 7.96967 11.9697C8.26256 11.6768 8.73744 11.6768 9.03033 11.9697L10.5 13.4393L14.9697 8.96967C15.2626 8.67678 15.7374 8.67678 16.0303 8.96967Z" fill="currentColor"></path></svg>';
  
  categoryIcon = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.5 4.5C3.5 3.67157 4.17157 3 5 3H9C9.82843 3 10.5 3.67157 10.5 4.5V8.5C10.5 9.32843 9.82843 10 9 10H5C4.17157 10 3.5 9.32843 3.5 8.5V4.5ZM5 4.5V8.5H9V4.5H5ZM13.5 4.5C13.5 3.67157 14.1716 3 15 3H19C19.8284 3 20.5 3.67157 20.5 4.5V8.5C20.5 9.32843 19.8284 10 19 10H15C14.1716 10 13.5 9.32843 13.5 8.5V4.5ZM15 4.5V8.5H19V4.5H15ZM3.5 15.5C3.5 14.6716 4.17157 14 5 14H9C9.82843 14 10.5 14.6716 10.5 15.5V19.5C10.5 20.3284 9.82843 21 9 21H5C4.17157 21 3.5 20.3284 3.5 19.5V15.5ZM5 15.5V19.5H9V15.5H5ZM13.5 15.5C13.5 14.6716 14.1716 14 15 14H19C19.8284 14 20.5 14.6716 20.5 15.5V19.5C20.5 20.3284 19.8284 21 19 21H15C14.1716 21 13.5 20.3284 13.5 19.5V15.5ZM15 15.5V19.5H19V15.5H15Z" fill="currentColor"></path></svg>';

  constructor(
    public translationService: TranslationService,
    private usersService: UsersService,
    private postsAdsService: PostsAdsService,
    private categoriesService: CategoriesService,
    private metalsPricesService: MetalsPricesService
  ) {}

  ngOnInit() {
    this.loadDashboardStats();
    this.loadMetalsPrices();
  }

  loadDashboardStats() {
    this.isLoading = true;
    const langCode = this.translationService.currentLanguageValue;

    forkJoin({
      users: this.usersService.listUsers({ page: 1, limit: 1 }),
      posts: this.postsAdsService.listPosts({ page: 1, limit: 1, langCode, status: 'all' }),
      activePosts: this.postsAdsService.listPosts({ page: 1, limit: 1, langCode, status: 'active' }),
      categories: this.categoriesService.listCategories({ page: 1, limit: 1, langCode }),
    }).subscribe({
      next: (results) => {
        this.stats.totalUsers = results.users.data?.pagination?.total || 0;
        this.stats.totalPosts = results.posts.data?.pagination?.total || 0;
        this.stats.activePosts = results.activePosts.data?.pagination?.total || 0;
        this.stats.totalCategories = results.categories.data?.pagination?.total || 0;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.isLoading = false;
      },
    });
  }

  loadMetalsPrices() {
    this.metalsPricesService.getHistoricalPrices({
      countryCode: 'AE',
      period: '1m'
    }).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.metalsCurrency = response.data.currency || 'AED';
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
      },
      error: (error) => {
        console.error('Error loading metals prices:', error);
      }
    });
  }
}
