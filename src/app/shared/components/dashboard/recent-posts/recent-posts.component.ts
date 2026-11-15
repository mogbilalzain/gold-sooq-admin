import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { PostAd } from '../../../services/data/posts-ads.service';
import { TranslationService } from '../../../services/translation.service';
import { SafeHtmlPipe } from '../../../pipe/safe-html.pipe';

@Component({
  selector: 'app-recent-posts',
  standalone: true,
  imports: [CommonModule, RouterModule, MatMenuModule, SafeHtmlPipe],
  template: `
    <div class="dashboard-card">
      <!-- Header: title + real count + view all -->
      <div class="ayar-card-head">
        <div class="flex items-center gap-2.5">
          <h3 class="dashboard-card-title">
            {{ translationService.t('dashboard.recentPosts') }}
          </h3>
          @if (total > 0) {
            <span class="ayar-pill ayar-pill-warning" dir="ltr">
              {{ total }} <span dir="auto">{{ translationService.t('dashboard.adsUnit') }}</span>
            </span>
          }
        </div>
        <a routerLink="/posts-ads" class="ayar-view-all">
          {{ translationService.t('dashboard.viewAllPosts') }}
          <svg class="attention-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </a>
      </div>

      @if (loading) {
        <!-- Skeleton rows -->
        <div class="animate-pulse space-y-4 pt-2">
          @for (i of [1, 2, 3, 4, 5]; track i) {
            <div class="flex items-center gap-4">
              <div class="h-12 w-12 shrink-0 rounded-xl bg-slate-100 dark:bg-[color:var(--color-surface-container-high)]"></div>
              <div class="h-3.5 flex-1 rounded bg-slate-100 dark:bg-[color:var(--color-surface-container-high)]"></div>
              <div class="hidden h-3.5 w-20 rounded bg-slate-100 md:block dark:bg-[color:var(--color-surface-container-high)]"></div>
              <div class="h-3.5 w-16 rounded bg-slate-100 dark:bg-[color:var(--color-surface-container-high)]"></div>
              <div class="hidden h-6 w-14 rounded-full bg-slate-100 sm:block dark:bg-[color:var(--color-surface-container-high)]"></div>
            </div>
          }
        </div>
      } @else if (!posts.length) {
        <p class="py-10 text-center text-sm text-slate-400 dark:text-[color:var(--color-on-surface-variant)]">
          {{ translationService.t('dashboard.noPosts') }}
        </p>
      } @else {
        <div class="-mx-2 overflow-x-auto px-2">
          <table class="ayar-table min-w-[720px] text-sm">
            <thead>
              <tr>
                <th>{{ translationService.t('posts.post') }}</th>
                <th>{{ translationService.t('posts.category') }}</th>
                <th>{{ translationService.t('posts.price') }}</th>
                <th>{{ translationService.t('posts.status') }}</th>
                <th>{{ translationService.t('common.date') }}</th>
                <th class="w-10"><span class="sr-only">{{ translationService.t('common.actions') }}</span></th>
              </tr>
            </thead>
            <tbody>
              @for (post of posts; track post.id) {
                <tr>
                  <!-- Post: image + title + merchant -->
                  <td class="pe-3">
                    <div class="flex items-center gap-3">
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
                      <div class="min-w-0">
                        <p class="max-w-[200px] truncate font-bold text-slate-900 dark:text-[color:var(--color-on-surface)]">
                          {{ post.post_title }}
                        </p>
                        <p class="mt-0.5 max-w-[200px] truncate text-xs text-slate-400 dark:text-[color:var(--color-on-surface-variant)]">
                          {{ translationService.t('dashboard.merchantLabel') }}:
                          {{ post.user_name || ('#' + post.id) }}
                        </p>
                      </div>
                    </div>
                  </td>
                  <!-- Category -->
                  <td class="pe-3 text-slate-500 dark:text-[color:var(--color-on-surface-variant)]">
                    {{ post.categoryName || '—' }}
                  </td>
                  <!-- Price -->
                  <td class="pe-3 whitespace-nowrap">
                    <span class="ayar-num font-extrabold text-slate-900 dark:text-[color:var(--color-on-surface)]" dir="ltr">
                      {{ post.price | number: '1.0-2' }}
                    </span>
                    <span class="ms-1 text-xs text-slate-400 dark:text-[color:var(--color-on-surface-variant)]">{{ post.currency }}</span>
                  </td>
                  <!-- Status -->
                  <td class="pe-3">
                    <span class="ayar-pill" [ngClass]="statusPillClass(post)">
                      {{ statusLabel(post) }}
                    </span>
                  </td>
                  <!-- Date dd/MM/yyyy -->
                  <td class="pe-3 whitespace-nowrap">
                    <span class="ayar-num text-xs text-slate-400 dark:text-[color:var(--color-on-surface-variant)]" dir="ltr">
                      {{ formatDate(post.create_date) }}
                    </span>
                  </td>
                  <!-- Row actions -->
                  <td>
                    <button
                      type="button"
                      class="ayar-row-menu-btn"
                      [matMenuTriggerFor]="rowMenu"
                      [attr.aria-label]="translationService.t('common.actions')"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <circle cx="12" cy="5" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="12" cy="19" r="1.8" />
                      </svg>
                    </button>
                    <mat-menu #rowMenu="matMenu" class="app-notif-menu">
                      <a mat-menu-item [routerLink]="['/posts-ads', post.id]" class="app-menu-item">
                        <span class="inline-flex h-4.5 w-4.5" [innerHTML]="eyeIcon | safeHtml"></span>
                        <span>{{ translationService.t('dashboard.viewDetails') }}</span>
                      </a>
                      <a mat-menu-item [routerLink]="['/posts-ads/edit', post.id]" class="app-menu-item">
                        <span class="inline-flex h-4.5 w-4.5" [innerHTML]="editIcon | safeHtml"></span>
                        <span>{{ translationService.t('dashboard.editPost') }}</span>
                      </a>
                    </mat-menu>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Real pagination: "showing X to Y of Z" + prev / numbers / next -->
        @if (total > 0) {
          <div class="mt-4 flex flex-wrap items-center justify-between gap-3 pt-1">
            <p class="text-xs text-slate-400 dark:text-[color:var(--color-on-surface-variant)]">
              {{ translationService.t('common.showing') }}
              <span class="ayar-num font-bold text-slate-600 dark:text-[color:var(--color-on-surface)]" dir="ltr">{{ rangeStart }}</span>
              {{ translationService.t('common.to') }}
              <span class="ayar-num font-bold text-slate-600 dark:text-[color:var(--color-on-surface)]" dir="ltr">{{ rangeEnd }}</span>
              {{ translationService.t('common.of') }}
              <span class="ayar-num font-bold text-slate-600 dark:text-[color:var(--color-on-surface)]" dir="ltr">{{ total }}</span>
              {{ translationService.t('dashboard.adsUnit') }}
            </p>
            @if (totalPages > 1) {
              <nav class="flex items-center gap-1" [attr.aria-label]="translationService.t('common.itemsPerPage')">
                <button
                  type="button"
                  class="ayar-page-btn"
                  [disabled]="page <= 1"
                  (click)="goTo(page - 1)"
                >
                  {{ translationService.t('common.previous') }}
                </button>
                @for (p of paginationPages; track p) {
                  <button
                    type="button"
                    class="ayar-page-btn ayar-num"
                    [class.ayar-page-btn-active]="p === page"
                    (click)="goTo(p)"
                  >
                    {{ p }}
                  </button>
                }
                <button
                  type="button"
                  class="ayar-page-btn"
                  [disabled]="page >= totalPages"
                  (click)="goTo(page + 1)"
                >
                  {{ translationService.t('common.next') }}
                </button>
              </nav>
            }
          </div>
        }
      }
    </div>
  `,
})
export class RecentPostsComponent {
  @Input() posts: PostAd[] = [];
  @Input() loading = false;
  /** Server-side totals driving the real pagination. */
  @Input() total = 0;
  @Input() page = 1;
  @Input() limit = 5;
  @Output() pageChange = new EventEmitter<number>();

  readonly eyeIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
  readonly editIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"/></svg>';

  constructor(public translationService: TranslationService) {}

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.limit));
  }

  get rangeStart(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.limit + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.page * this.limit, this.total);
  }

  /** Up to 5 numbered buttons in a sliding window around the current page. */
  get paginationPages(): number[] {
    const total = this.totalPages;
    const start = Math.max(1, Math.min(this.page - 2, total - 4));
    const end = Math.min(start + 4, total);
    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }

  goTo(page: number) {
    if (page < 1 || page > this.totalPages || page === this.page) return;
    this.pageChange.emit(page);
  }

  getImageUrl(post: PostAd): string {
    // API returns a complete CDN URL — used directly.
    return post.main_image_url ?? '';
  }

  /** One pill per row: pending amber, rejected red, active green, approved blue. */
  statusPillClass(post: PostAd): string {
    if (post.review_status === 'pending') return 'ayar-pill-warning';
    if (post.review_status === 'rejected') return 'ayar-pill-error';
    return post.is_active === '1' ? 'ayar-pill-success' : 'ayar-pill-info';
  }

  statusLabel(post: PostAd): string {
    if (post.review_status === 'pending') return this.translationService.t('posts.pending');
    if (post.review_status === 'rejected') return this.translationService.t('posts.rejected');
    return post.is_active === '1'
      ? this.translationService.t('posts.active')
      : this.translationService.t('posts.approved');
  }

  /** dd/MM/yyyy — digits stay LTR in both languages. */
  formatDate(value?: string): string {
    if (!value) return '—';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '—';
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${date.getFullYear()}`;
  }
}
