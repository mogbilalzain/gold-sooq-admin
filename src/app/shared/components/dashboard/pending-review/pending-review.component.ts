import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PostAd } from '../../../services/data/posts-ads.service';
import { TranslationService } from '../../../services/translation.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

/** M3 two-line list of the newest ads awaiting moderation. */
@Component({
  selector: 'app-pending-review',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule, MatIconModule, MatListModule],
  template: `
    <mat-card appearance="outlined" class="h-full">
      <mat-card-header class="justify-between">
        <mat-card-title class="flex items-center gap-2.5 text-m3-title-lg font-medium">
          {{ translationService.t('dashboard.pendingReview') }}
          @if (pendingCount) {
            <span
              class="ayar-num inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-(--mat-sys-primary) px-1.5 text-m3-label-md font-medium text-(--mat-sys-on-primary)"
            >
              {{ pendingCount }}
            </span>
          }
        </mat-card-title>
        <a
          matButton="text"
          routerLink="/posts-ads"
          [queryParams]="{ status: 'pending' }"
          class="app-btn-sm -me-2 shrink-0"
        >
          {{ translationService.t('dashboard.viewAll') }}
          <mat-icon class="app-icon-flip">arrow_forward</mat-icon>
        </a>
      </mat-card-header>

      <mat-card-content class="flex-1">
        @if (loading) {
          <div class="animate-pulse space-y-3 py-2">
            @for (i of [1, 2, 3]; track i) {
              <div class="flex items-center gap-3">
                <div class="app-skeleton h-12 w-12 shrink-0" style="border-radius: 9999px"></div>
                <div class="flex-1 space-y-2">
                  <div class="app-skeleton h-3.5 w-3/4"></div>
                  <div class="app-skeleton h-3 w-1/2"></div>
                </div>
              </div>
            }
          </div>
        } @else if (!pendingPosts.length) {
          <div class="flex flex-1 flex-col items-center justify-center py-10 text-center">
            <span
              class="app-tone-success mb-4 flex h-20 w-20 items-center justify-center rounded-full"
            >
              <mat-icon style="font-size: 40px; width: 40px; height: 40px">task_alt</mat-icon>
            </span>
            <p class="text-m3-title-md font-medium text-(--mat-sys-on-surface)">
              {{ translationService.t('dashboard.noPending') }}
            </p>
            <p class="mt-1.5 max-w-xs text-m3-body-md text-(--mat-sys-on-surface-variant)">
              {{ translationService.t('dashboard.noPendingDesc') }}
            </p>
          </div>
        } @else {
          <mat-nav-list>
            @for (post of pendingPosts; track post.id) {
              <a mat-list-item [routerLink]="['/posts-ads', post.id]">
                @if (post.main_image_url) {
                  <img
                    matListItemAvatar
                    [src]="getImageUrl(post)"
                    [alt]="post.post_title"
                    class="object-cover"
                    loading="lazy"
                  />
                } @else {
                  <div
                    matListItemAvatar
                    class="app-tone-primary flex items-center justify-center text-m3-title-sm font-medium"
                  >
                    {{ post.post_title.charAt(0) || '؟' }}
                  </div>
                }
                <span matListItemTitle>{{ post.post_title }}</span>
                <span matListItemLine>
                  {{ post.categoryName || post.user_name || '#' + post.id }}
                  @if (relativeTime(post.create_date); as ago) {
                    <span class="mx-1">·</span>{{ ago }}
                  }
                </span>
                <span matListItemMeta dir="ltr" class="ayar-num">
                  <span class="font-medium text-(--mat-sys-primary)">
                    {{ post.price | number: '1.0-2' }}
                  </span>
                  <span class="text-[10px] text-(--mat-sys-on-surface-variant)">
                    {{ post.currency }}
                  </span>
                </span>
              </a>
            }
          </mat-nav-list>
        }
      </mat-card-content>

      @if (!loading && total !== null && total > pendingPosts.length) {
        <mat-card-actions>
          <a
            matButton="outlined"
            routerLink="/posts-ads"
            [queryParams]="{ status: 'pending' }"
            class="w-full"
          >
            <span dir="ltr" class="ayar-num">+{{ total - pendingPosts.length }}</span>
            {{ translationService.t('dashboard.morePending') }}
          </a>
        </mat-card-actions>
      }
    </mat-card>
  `,
})
export class PendingReviewComponent {
  @Input() posts: PostAd[] = [];
  /** Server-side count of all pending ads; the list only shows the first few. */
  @Input() total: number | null = null;
  @Input() loading = false;

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
