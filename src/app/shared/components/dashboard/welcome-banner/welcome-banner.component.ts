import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { TranslationService } from '../../../services/translation.service';
import { SafeHtmlPipe } from '../../../pipe/safe-html.pipe';

interface QuickLink {
  labelKey: string;
  route: string;
  queryParams?: Record<string, string>;
  icon: string;
}

@Component({
  selector: 'app-welcome-banner',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeHtmlPipe],
  template: `
    <div class="welcome-banner">
      <div class="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div class="min-w-0">
          <h2 class="text-m3-headline-sm sm:text-m3-headline-md font-semibold text-[color:var(--color-on-surface)]">
            {{ greeting }}{{ firstName ? '، ' + firstName : '' }}
          </h2>
          <p class="mt-1 text-sm text-[color:var(--color-on-surface-variant)]">
            {{ todayLabel }}
          </p>
          <div class="mt-3">
            @if (pendingTotal > 0) {
              <span
                class="inline-flex items-center gap-2 rounded-full bg-warning-500/10 px-3 py-1.5 text-sm font-medium text-warning-700 dark:text-warning-400"
              >
                <span
                  class="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-warning-500 px-1.5 text-xs font-bold text-white"
                >
                  {{ pendingTotal }}
                </span>
                {{ translationService.t('dashboard.pendingSummary') }}
              </span>
            } @else {
              <span
                class="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-success-wash)] px-3 py-1.5 text-sm font-medium text-[color:var(--color-success-wash-text)]"
              >
                <span class="inline-flex h-4 w-4" [innerHTML]="checkIcon | safeHtml"></span>
                {{ translationService.t('dashboard.noPendingTasks') }}
              </span>
            }
          </div>
        </div>

        <nav
          class="flex flex-wrap items-center gap-2"
          [attr.aria-label]="translationService.t('dashboard.quickLinks')"
        >
          @for (link of quickLinks; track link.labelKey) {
            <a [routerLink]="link.route" [queryParams]="link.queryParams" class="welcome-chip">
              <span class="inline-flex h-4 w-4 shrink-0" [innerHTML]="link.icon | safeHtml"></span>
              {{ translationService.t(link.labelKey) }}
            </a>
          }
        </nav>
      </div>
    </div>
  `,
})
export class WelcomeBannerComponent {
  /** Total open tasks across all queues; drives the summary pill. */
  @Input() pendingTotal = 0;

  readonly checkIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';

  readonly quickLinks: QuickLink[] = [
    {
      labelKey: 'dashboard.quickReviewAds',
      route: '/posts-ads',
      queryParams: { status: 'pending' },
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h10M7 13h6"/></svg>',
    },
    {
      labelKey: 'dashboard.quickSendNotification',
      route: '/notifications/send',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7Z"/></svg>',
    },
    {
      labelKey: 'dashboard.quickMetalsPrices',
      route: '/metals-prices',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="9" r="5"/><circle cx="16" cy="15" r="5"/></svg>',
    },
    {
      labelKey: 'dashboard.quickSiteAnalytics',
      route: '/site-analytics',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 15l4-6 4 3 5-8"/></svg>',
    },
  ];

  constructor(
    public translationService: TranslationService,
    private authService: AuthService
  ) {}

  get greeting(): string {
    const hour = new Date().getHours();
    const key =
      hour >= 5 && hour < 12
        ? 'dashboard.greetingMorning'
        : hour < 17
          ? 'dashboard.greetingAfternoon'
          : 'dashboard.greetingEvening';
    return this.translationService.t(key);
  }

  get firstName(): string {
    const fullName = this.authService.getCurrentUser()?.fullName || '';
    return fullName.split(' ')[0] || '';
  }

  get todayLabel(): string {
    const locale = this.translationService.currentLanguageValue === 'ar' ? 'ar-AE' : 'en-GB';
    return new Date().toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}
