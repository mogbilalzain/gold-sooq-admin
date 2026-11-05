import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  // Strip any trailing slash so URL concatenation never produces a double slash.
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/+$/, '');
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

  getMediaUrl(): string {
    return `${this.baseUrl}/media`;
  }

  getAdminAdAttributesUrl(): string {
    return `${this.baseUrl}/admin/ad-attributes`;
  }

  getAdminIdentityUrl(): string {
    return `${this.baseUrl}/admin/identity`;
  }

  getAdminBusinessUrl(): string {
    return `${this.baseUrl}/admin/business`;
  }

  getAdminContactMessagesUrl(): string {
    return `${this.baseUrl}/admin/contact-messages`;
  }

  getAdminInboxUrl(): string {
    return `${this.baseUrl}/admin/inbox`;
  }

  getAdminStatsUrl(): string {
    return `${this.baseUrl}/admin/stats`;
  }

  /** socket.io is served from the API host root (`/socket.io/`), not under the API path. */
  getSocketUrl(): string {
    return new URL(this.baseUrl).origin;
  }

  // Public lookup endpoints (no admin prefix; token still attached by the interceptor)
  getCountriesCurrenciesUrl(): string {
    return `${this.baseUrl}/countriesCurrencies`;
  }

  getStatesUrl(): string {
    return `${this.baseUrl}/states`;
  }
}

