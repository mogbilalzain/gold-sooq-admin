import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly timeout = environment.apiTimeout;

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getTimeout(): number {
    return this.timeout;
  }

  // Admin API endpoints
  getAdminAuthUrl(): string {
    return `${this.baseUrl}/admin/auth`;
  }

  getAdminCategoriesUrl(): string {
    return `${this.baseUrl}/admin/categories`;
  }

  getAdminPostsAdsUrl(): string {
    return `${this.baseUrl}/admin/posts-ads`;
  }

  getAdminUsersUrl(): string {
    return `${this.baseUrl}/admin/users`;
  }

  getAdminMetalsPricesUrl(): string {
    return `${this.baseUrl}/admin/metals-prices`;
  }

  getAdminNotificationsUrl(): string {
    return `${this.baseUrl}/admin/notifications`;
  }
}

