import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PostAd } from '../../../services/data/posts-ads.service';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-recent-posts',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div
      class="rounded-m3-lg border border-outline-variant/50 bg-surface-container-lowest p-6 shadow-elevation-1 dark:border-outline-variant dark:bg-surface-container"
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-5">
        <div>
          <h3 class="text-m3-title-lg font-medium text-surface-on-surface">
            {{ translationService.t('dashboard.recentPosts') }}
          </h3>
          <p class="text-sm text-surface-on-surface-variant mt-0.5">
            {{ translationService.t('dashboard.recentPostsHint') }}
          </p>
        </div>
        <a
          routerLink="/posts-ads"
          class="modern-button modern-button-secondary px-4 text-m3-label-lg"
        >
          {{ translationService.t('dashboard.viewAll') }}
        </a>
      </div>

      @if (loading) {
        <!-- Skeleton rows -->
        <div class="animate-pulse space-y-4">
          @for (i of [1, 2, 3, 4, 5]; track i) {
            <div class="flex items-center gap-4">
              <div class="h-11 w-11 rounded-xl bg-surface-container-high shrink-0"></div>
              <div class="h-3.5 flex-1 rounded bg-surface-container-high"></div>
              <div class="h-3.5 w-20 rounded bg-surface-container-high hidden md:block"></div>
              <div class="h-3.5 w-16 rounded bg-surface-container-high"></div>
              <div class="h-6 w-14 rounded-full bg-surface-container-high hidden sm:block"></div>
            </div>
          }
        </div>
      } @else if (!posts.length) {
        <p class="py-10 text-center text-sm text-surface-on-surface-variant">
          {{ translationService.t('dashboard.noPosts') }}
        </p>
      } @else {
        <div class="overflow-x-auto -mx-2 px-2">
          <table class="w-full min-w-[640px] text-sm">
            <thead>
              <tr class="border-b border-outline-variant/30 text-start">
                <th class="pb-3 text-start text-m3-label-lg font-medium text-surface-on-surface-variant">
                  {{ translationService.t('posts.post') }}
                </th>
                <th class="pb-3 text-start text-m3-label-lg font-medium text-surface-on-surface-variant">
                  {{ translationService.t('posts.category') }}
                </th>
                <th class="pb-3 text-start text-m3-label-lg font-medium text-surface-on-surface-variant">
                  {{ translationService.t('posts.price') }}
                </th>
                <th class="pb-3 text-start text-m3-label-lg font-medium text-surface-on-surface-variant">
                  {{ translationService.t('posts.status') }}
                </th>
                <th class="pb-3 text-start text-m3-label-lg font-medium text-surface-on-surface-variant">
                  {{ translationService.t('posts.reviewStatus') }}
                </th>
                <th class="pb-3 text-start text-m3-label-lg font-medium text-surface-on-surface-variant">
                  {{ translationService.t('common.date') }}
                </th>
              </tr>
            </thead>
            <tbody>
              @for (post of posts; track post.id) {
                <tr
                  class="gold-row-hover border-b border-outline-variant/40 last:border-0 transition-colors"
                >
                  <!-- Post -->
                  <td class="py-3 pe-3">
                    <div class="flex items-center gap-3">
                      @if (post.main_image_url) {
                        <img
                          [src]="getImageUrl(post)"
                          [alt]="post.post_title"
                          class="h-10 w-10 rounded-xl object-cover shrink-0"
                          loading="lazy"
                        />
                      } @else {
                        <span
                          class="flex h-10 w-10 items-center justify-center rounded-m3-md bg-[color:var(--color-primary-container)] text-[color:var(--color-on-primary-container)] shrink-0 text-xs font-bold"
                        >
                          {{ post.post_title.charAt(0) || '؟' }}
                        </span>
                      }
                      <div class="min-w-0">
                        <p class="max-w-[180px] truncate font-semibold text-surface-on-surface">
                          {{ post.post_title }}
                        </p>
                        <p class="text-xs text-surface-on-surface-variant">
                          {{ post.user_name || ('#' + post.id) }}
                        </p>
                      </div>
                    </div>
                  </td>
                  <!-- Category -->
                  <td class="py-3 pe-3 text-surface-on-surface-variant">
                    {{ post.categoryName || '—' }}
                  </td>
                  <!-- Price -->
                  <td class="py-3 pe-3 whitespace-nowrap">
                    <span class="font-bold text-surface-on-surface">
                      {{ post.price | number: '1.0-2' }}
                    </span>
                    <span class="text-xs text-surface-on-surface-variant ms-1">{{ post.currency }}</span>
                  </td>
                  <!-- Active status -->
                  <td class="py-3 pe-3">
                    <span
                      class="status-pill"
                      [ngClass]="getActiveBadgeClass(post)"
                    >
                      {{ post.is_active === '1'
                        ? translationService.t('posts.active')
                        : translationService.t('posts.inactive') }}
                    </span>
                  </td>
                  <!-- Review status -->
                  <td class="py-3 pe-3">
                    <span
                      class="status-pill"
                      [ngClass]="getReviewBadgeClass(post)"
                    >
                      {{ reviewLabel(post) }}
                    </span>
                  </td>
                  <!-- Date -->
                  <td class="py-3 text-xs text-surface-on-surface-variant whitespace-nowrap">
                    {{ formatDate(post.create_date) }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class RecentPostsComponent {
  @Input() posts: PostAd[] = [];
  @Input() loading = false;

  constructor(public translationService: TranslationService) {}

  getImageUrl(post: PostAd): string {
    // API returns a complete CDN URL — used directly.
    return post.main_image_url ?? '';
  }

  getActiveBadgeClass(post: PostAd): string {
    return post.is_active === '1'
      ? 'status-pill-success'
      : 'bg-surface-container-high text-surface-on-surface-variant';
  }

  getReviewBadgeClass(post: PostAd): string {
    switch (post.review_status) {
      case 'approved':
        return 'status-pill-success';
      case 'rejected':
        return 'status-pill-error';
      default:
        return 'status-pill-warning';
    }
  }

  reviewLabel(post: PostAd): string {
    switch (post.review_status) {
      case 'approved':
        return this.translationService.t('posts.approved');
      case 'rejected':
        return this.translationService.t('posts.rejected');
      default:
        return this.translationService.t('posts.pending');
    }
  }

  formatDate(value?: string): string {
    if (!value) return '—';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString(
      this.translationService.currentLanguageValue === 'ar' ? 'ar-SA' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );
  }
}
