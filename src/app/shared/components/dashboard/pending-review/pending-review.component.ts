import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PostAd } from '../../../services/data/posts-ads.service';
import { TranslationService } from '../../../services/translation.service';
import { SafeHtmlPipe } from '../../../pipe/safe-html.pipe';

@Component({
  selector: 'app-pending-review',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeHtmlPipe],
  template: `
    <div class="dashboard-card h-full flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between mb-5">
        <div>
          <h3 class="dashboard-card-title flex items-center gap-2">
            {{ translationService.t('dashboard.pendingReview') }}
            @if (pendingCount) {
              <span
                class="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-warning-500/15 px-1.5 text-xs font-bold text-warning-600 dark:text-warning-400"
              >
                {{ pendingCount }}
              </span>
            }
          </h3>
          <p class="dashboard-card-hint">
            {{ translationService.t('dashboard.pendingReviewHint') }}
          </p>
        </div>
        <a
          routerLink="/posts-ads"
          [queryParams]="{ status: 'pending' }"
          class="state-layer inline-flex h-10 items-center rounded-full px-3 text-m3-label-lg font-medium text-brand-700 dark:text-brand-300"
        >
          {{ translationService.t('dashboard.viewAll') }}
        </a>
      </div>

      @if (loading) {
        <div class="animate-pulse space-y-3">
          @for (i of [1, 2, 3]; track i) {
            <div class="flex items-center gap-3">
              <div class="h-12 w-12 rounded-xl bg-surface-container-high shrink-0"></div>
              <div class="flex-1 space-y-2">
                <div class="h-3.5 w-3/4 rounded bg-surface-container-high"></div>
                <div class="h-3 w-1/2 rounded bg-surface-container-high"></div>
              </div>
            </div>
          }
        </div>
      } @else if (!pendingPosts.length) {
        <!-- Empty state -->
        <div class="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <span
            class="flex h-14 w-14 items-center justify-center rounded-m3-lg bg-[color:var(--color-success-wash)] text-[color:var(--color-success-wash-text)] mb-3"
            [innerHTML]="checkIcon | safeHtml"
          ></span>
          <p class="text-sm font-medium text-surface-on-surface-variant">
            {{ translationService.t('dashboard.noPending') }}
          </p>
        </div>
      } @else {
        <ul class="space-y-3 flex-1">
          @for (post of pendingPosts; track post.id) {
            <li>
              <a
                [routerLink]="['/posts-ads', post.id]"
                class="state-layer flex items-center gap-3 rounded-m3-md bg-surface-container-low p-3 dark:bg-surface-container-high"
              >
                @if (post.main_image_url) {
                  <img
                    [src]="getImageUrl(post)"
                    [alt]="post.post_title"
                    class="h-12 w-12 rounded-xl object-cover shrink-0"
                    loading="lazy"
                  />
                } @else {
                  <span
                    class="flex h-12 w-12 items-center justify-center rounded-m3-md bg-[color:var(--color-primary-container)] text-[color:var(--color-on-primary-container)] shrink-0 text-sm font-bold"
                  >
                    {{ post.post_title.charAt(0) || '؟' }}
                  </span>
                }
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold text-surface-on-surface">
                    {{ post.post_title }}
                  </p>
                  <p class="truncate text-xs text-surface-on-surface-variant mt-0.5">
                    {{ post.categoryName || post.user_name || ('#' + post.id) }}
                    @if (relativeTime(post.create_date); as ago) {
                      <span class="mx-1">·</span>{{ ago }}
                    }
                  </p>
                </div>
                <div class="text-end shrink-0">
                  <p class="text-sm font-bold text-brand-600 dark:text-brand-400">
                    {{ post.price | number: '1.0-2' }}
                    <span class="text-[10px] font-medium">{{ post.currency }}</span>
                  </p>
                  <span
                    class="status-pill status-pill-warning mt-1 !px-2 !py-0.5 !text-m3-label-sm"
                  >
                    {{ translationService.t('posts.pending') }}
                  </span>
                </div>
              </a>
            </li>
          }
        </ul>

        @if (total !== null && total > pendingPosts.length) {
          <a
            routerLink="/posts-ads"
            [queryParams]="{ status: 'pending' }"
            class="state-layer mt-4 flex items-center justify-center gap-1.5 rounded-m3-md border border-dashed border-outline-variant/60 py-2.5 text-sm font-medium text-brand-700 dark:text-brand-300"
          >
            +{{ total - pendingPosts.length }}
            {{ translationService.t('dashboard.morePending') }}
          </a>
        }
      }
    </div>
  `,
})
export class PendingReviewComponent {
  @Input() posts: PostAd[] = [];
  /** Server-side count of all pending ads; the list only shows the first few. */
  @Input() total: number | null = null;
  @Input() loading = false;

  readonly checkIcon =
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>';

  constructor(public translationService: TranslationService) {}

  get pendingPosts(): PostAd[] {
    return this.posts.filter((p) => p.review_status === 'pending');
  }

  get pendingCount(): number {
    return this.total ?? this.pendingPosts.length;
  }

  getImageUrl(post: PostAd): string {
    // API returns a complete CDN URL — used directly.
    return post.main_image_url ?? '';
  }

  /** "قبل 3 أيام" / "2 days ago" — Intl handles Arabic plural forms correctly. */
  relativeTime(value?: string): string {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
    const diffMs = date.getTime() - Date.now();
    const absSec = Math.abs(diffMs / 1000);
    const locale = this.translationService.currentLanguageValue === 'ar' ? 'ar' : 'en';
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    if (absSec < 3600) return rtf.format(Math.round(diffMs / 60000), 'minute');
    if (absSec < 86400) return rtf.format(Math.round(diffMs / 3600000), 'hour');
    if (absSec < 86400 * 30) return rtf.format(Math.round(diffMs / 86400000), 'day');
    return rtf.format(Math.round(diffMs / (86400000 * 30)), 'month');
  }
}
