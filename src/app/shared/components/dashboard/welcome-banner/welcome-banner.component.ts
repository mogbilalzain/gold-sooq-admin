import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { TranslationService } from '../../../services/translation.service';
import { SafeHtmlPipe } from '../../../pipe/safe-html.pipe';

@Component({
  selector: 'app-welcome-banner',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeHtmlPipe],
  template: `
    <div class="dashboard-card relative overflow-hidden">
      <!-- Soft gold glow in the corner, decorative only -->
      <div
        class="pointer-events-none absolute -top-24 end-0 h-64 w-64 rounded-full opacity-60 blur-3xl dark:opacity-20"
        style="background: radial-gradient(circle, rgba(212,168,83,0.25), transparent 70%)"
        aria-hidden="true"
      ></div>

      <div class="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0">
          <h2 class="text-2xl font-extrabold text-slate-900 sm:text-3xl dark:text-[color:var(--color-on-surface)]">
            {{ greeting }}{{ firstName ? '، ' + firstName : '' }}
          </h2>
          <p class="mt-1.5 text-sm text-slate-500 dark:text-[color:var(--color-on-surface-variant)]">
            {{ todayLabel }} · {{ translationService.t('dashboard.subtitle') }}
          </p>
          <div class="mt-4">
            @if (pendingTotal > 0) {
              <span
                class="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3.5 py-1.5 text-sm font-bold text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/25"
              >
                <span class="relative flex h-2.5 w-2.5">
                  <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60"></span>
                  <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                </span>
                <span class="ayar-num" dir="ltr">{{ pendingTotal }}</span>
                {{ translationService.t('dashboard.pendingSummary') }}
              </span>
            } @else {
              <span
                class="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-sm font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/25"
              >
                <span class="inline-flex h-4 w-4" [innerHTML]="checkIcon | safeHtml"></span>
                {{ translationService.t('dashboard.noPendingTasks') }}
              </span>
            }
          </div>
        </div>

        <a
          routerLink="/posts-ads"
          [queryParams]="{ status: 'pending' }"
          class="ayar-btn ayar-btn-dark shrink-0 sm:self-center"
        >
          <span class="inline-flex h-4 w-4" [innerHTML]="reviewIcon | safeHtml"></span>
          {{ translationService.t('dashboard.quickReviewAds') }}
        </a>
      </div>
    </div>
  `,
})
export class WelcomeBannerComponent {
  /** Total open tasks across all queues; drives the summary pill. */
  @Input() pendingTotal = 0;

  readonly checkIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
  readonly reviewIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h10M7 13h6"/></svg>';

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
