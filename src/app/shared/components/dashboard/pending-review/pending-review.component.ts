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
    <div class="dashboard-card flex h-full flex-col">
      <!-- Header separated by a hairline -->
      <div class="ayar-card-head">
        <div class="flex items-center gap-2.5">
          <h3 class="dashboard-card-title">
            {{ translationService.t('dashboard.pendingReview') }}
          </h3>
          @if (pendingCount) {
            <span
              class="ayar-num inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-extrabold text-white"
            >
              {{ pendingCount }}
            </span>
          }
        </div>
        <a routerLink="/posts-ads" [queryParams]="{ status: 'pending' }" class="ayar-view-all">
          {{ translationService.t('dashboard.viewAll') }}
          <svg class="attention-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </a>
      </div>

      @if (loading) {
        <div class="animate-pulse space-y-3">
          @for (i of [1, 2, 3]; track i) {
            <div class="flex items-center gap-3">
              <div class="h-12 w-12 shrink-0 rounded-xl bg-slate-100 dark:bg-[color:var(--color-surface-container-high)]"></div>
              <div class="flex-1 space-y-2">
                <div class="h-3.5 w-3/4 rounded bg-slate-100 dark:bg-[color:var(--color-surface-container-high)]"></div>
                <div class="h-3 w-1/2 rounded bg-slate-100 dark:bg-[color:var(--color-surface-container-high)]"></div>
              </div>
            </div>
          }
        </div>
      } @else if (!pendingPosts.length) {
        <!-- Big empty state -->
        <div class="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <span
            class="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-500 ring-1 ring-inset ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20"
            [innerHTML]="checkIcon | safeHtml"
          ></span>
          <p class="text-base font-bold text-slate-900 dark:text-[color:var(--color-on-surface)]">
            {{ translationService.t('dashboard.noPending') }}
          </p>
          <p class="mt-1.5 max-w-xs text-sm text-slate-400 dark:text-[color:var(--color-on-surface-variant)]">
            {{ translationService.t('dashboard.noPendingDesc') }}
          </p>
        </div>
      } @else {
        <ul class="flex-1 space-y-3">
          @for (post of pendingPosts; track post.id) {
            <li>
              <a
                [routerLink]="['/posts-ads', post.id]"
                class="group flex items-center gap-3 rounded-xl bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:bg-[color:var(--color-surface-container-high)] dark:hover:bg-[color:var(--color-surface-container-highest)]"
              >
                @if (post.main_image_url) {
                  <img
                    [src]="getImageUrl(post)"
                    [alt]="post.post_title"
                    class="h-12 w-12 shrink-0 rounded-xl object-cover"
                    loading="lazy"
                  />
                } @else {
                  <span
                    class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-sm font-extrabold text-gold-700 dark:bg-gold-500/15 dark:text-gold-400"
                  >
                    {{ post.post_title.charAt(0) || '؟' }}
                  </span>
                }
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-bold text-slate-900 dark:text-[color:var(--color-on-surface)]">
                    {{ post.post_title }}
                  </p>
                  <p class="mt-0.5 truncate text-xs text-slate-400 dark:text-[color:var(--color-on-surface-variant)]">
                    {{ post.categoryName || post.user_name || ('#' + post.id) }}
                    @if (relativeTime(post.create_date); as ago) {
                      <span class="mx-1">·</span>{{ ago }}
                    }
                  </p>
                </div>
                <div class="shrink-0 text-end">
                  <p class="ayar-num text-sm font-extrabold text-gold-600 dark:text-gold-400" dir="ltr">
                    {{ post.price | number: '1.0-2' }}
                    <span class="text-[10px] font-semibold">{{ post.currency }}</span>
                  </p>
                  <span class="ayar-pill ayar-pill-warning mt-1">
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
            class="ayar-btn ayar-btn-outline mt-4 w-full border-dashed"
          >
            <span dir="ltr" class="ayar-num">+{{ total - pendingPosts.length }}</span>
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
    '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>';

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
