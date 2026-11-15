import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { TranslationService } from '../../../services/translation.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

/** M3 filled hero card (primary-container) greeting the signed-in admin. */
@Component({
  selector: 'app-welcome-banner',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule, MatChipsModule, MatIconModule],
  template: `
    <mat-card appearance="filled" class="app-hero-card text-(--mat-sys-on-primary-container)">
      <div class="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div class="min-w-0">
          <h2 class="text-m3-headline-md font-medium">
            {{ greeting }}{{ firstName ? '، ' + firstName : '' }}
          </h2>
          <p class="mt-1.5 text-m3-body-md opacity-80">
            {{ todayLabel }} · {{ translationService.t('dashboard.subtitle') }}
          </p>
          <div class="mt-4">
            <mat-chip-set aria-hidden="true">
              <mat-chip class="app-chip-surface">
                <mat-icon>{{ pendingTotal > 0 ? 'pending_actions' : 'task_alt' }}</mat-icon>
                @if (pendingTotal > 0) {
                  <span class="ayar-num" dir="ltr">{{ pendingTotal }}</span>
                  {{ translationService.t('dashboard.pendingSummary') }}
                } @else {
                  {{ translationService.t('dashboard.noPendingTasks') }}
                }
              </mat-chip>
            </mat-chip-set>
          </div>
        </div>

        <a
          matButton="filled"
          routerLink="/posts-ads"
          [queryParams]="{ status: 'pending' }"
          class="shrink-0 sm:self-center"
        >
          <mat-icon>rate_review</mat-icon>
          {{ translationService.t('dashboard.quickReviewAds') }}
        </a>
      </div>
    </mat-card>
  `,
})
export class WelcomeBannerComponent {
  /** Total open tasks across all queues; drives the summary chip. */
  @Input() pendingTotal = 0;

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
