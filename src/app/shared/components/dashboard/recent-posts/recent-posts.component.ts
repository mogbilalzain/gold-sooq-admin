import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { PostAd } from '../../../services/data/posts-ads.service';
import { TranslationService } from '../../../services/translation.service';
import { PaginationComponent } from '../../common/pagination/pagination.component';

/** M3 table card: newest ads with status chips and mat-paginator. */
@Component({
  selector: 'app-recent-posts',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatMenuModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    PaginationComponent,
  ],
  template: `
    <mat-card appearance="outlined">
      <mat-card-header class="justify-between">
        <div class="min-w-0">
          <mat-card-title class="text-m3-title-lg font-medium">
            {{ translationService.t('dashboard.recentPosts') }}
          </mat-card-title>
          <mat-card-subtitle>
            <span class="ayar-num" dir="ltr">{{ total }}</span>
            {{ translationService.t('dashboard.adsUnit') }}
          </mat-card-subtitle>
        </div>
        <a matButton="text" routerLink="/posts-ads" class="app-btn-sm -me-2 shrink-0">
          {{ translationService.t('dashboard.viewAllPosts') }}
          <mat-icon class="app-icon-flip">arrow_forward</mat-icon>
        </a>
      </mat-card-header>

      <mat-card-content>
        @if (loading) {
          <!-- Skeleton rows -->
          <div class="animate-pulse space-y-4 pt-2">
            @for (i of [1, 2, 3, 4, 5]; track i) {
              <div class="flex items-center gap-4">
                <div class="app-skeleton h-12 w-12 shrink-0"></div>
                <div class="app-skeleton h-3.5 flex-1"></div>
                <div class="app-skeleton hidden h-3.5 w-20 md:block"></div>
                <div class="app-skeleton h-3.5 w-16"></div>
                <div class="app-skeleton hidden h-6 w-14 sm:block" style="border-radius: 9999px"></div>
              </div>
            }
          </div>
        } @else if (!posts.length) {
          <p class="py-10 text-center text-m3-body-md text-(--mat-sys-on-surface-variant)">
            {{ translationService.t('dashboard.noPosts') }}
          </p>
        } @else {
          <div class="-mx-2 overflow-x-auto px-2">
            <table mat-table [dataSource]="posts" class="min-w-[720px] text-sm">
              <!-- Post: image + title + merchant -->
              <ng-container matColumnDef="post">
                <th mat-header-cell *matHeaderCellDef>{{ translationService.t('posts.post') }}</th>
                <td mat-cell *matCellDef="let post" class="pe-3">
                  <div class="flex items-center gap-3 py-2">
                    @if (post.main_image_url) {
                      <img
                        [src]="getImageUrl(post)"
                        [alt]="post.post_title"
                        class="h-12 w-12 shrink-0 rounded-xl object-cover"
                        loading="lazy"
                      />
                    } @else {
                      <span
                        class="app-tone-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-m3-title-sm font-medium"
                      >
                        {{ post.post_title.charAt(0) || '؟' }}
                      </span>
                    }
                    <div class="min-w-0">
                      <p class="max-w-[200px] truncate font-medium text-(--mat-sys-on-surface)">
                        {{ post.post_title }}
                      </p>
                      <p class="mt-0.5 max-w-[200px] truncate text-m3-body-md text-(--mat-sys-on-surface-variant)">
                        {{ translationService.t('dashboard.merchantLabel') }}:
                        {{ post.user_name || '#' + post.id }}
                      </p>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Category -->
              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef>{{ translationService.t('posts.category') }}</th>
                <td mat-cell *matCellDef="let post" class="pe-3 text-(--mat-sys-on-surface-variant)">
                  {{ post.categoryName || '—' }}
                </td>
              </ng-container>

              <!-- Price -->
              <ng-container matColumnDef="price">
                <th mat-header-cell *matHeaderCellDef>{{ translationService.t('posts.price') }}</th>
                <td mat-cell *matCellDef="let post" class="pe-3 whitespace-nowrap">
                  <span class="ayar-num font-medium text-(--mat-sys-on-surface)" dir="ltr">
                    {{ post.price | number: '1.0-2' }}
                  </span>
                  <span class="ms-1 text-m3-body-md text-(--mat-sys-on-surface-variant)">{{ post.currency }}</span>
                </td>
              </ng-container>

              <!-- Status: static role-tinted chip -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>{{ translationService.t('posts.status') }}</th>
                <td mat-cell *matCellDef="let post" class="pe-3">
                  <mat-chip-set aria-hidden="true">
                    <mat-chip [ngClass]="statusChipClass(post)">
                      {{ statusLabel(post) }}
                    </mat-chip>
                  </mat-chip-set>
                </td>
              </ng-container>

              <!-- Date dd/MM/yyyy -->
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>{{ translationService.t('common.date') }}</th>
                <td mat-cell *matCellDef="let post" class="pe-3 whitespace-nowrap">
                  <span class="ayar-num text-m3-body-md text-(--mat-sys-on-surface-variant)" dir="ltr">
                    {{ formatDate(post.create_date) }}
                  </span>
                </td>
              </ng-container>

              <!-- Row actions -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="w-10">
                  <span class="sr-only">{{ translationService.t('common.actions') }}</span>
                </th>
                <td mat-cell *matCellDef="let post">
                  <button
                    type="button"
                    matIconButton
                    [matMenuTriggerFor]="rowMenu"
                    [attr.aria-label]="translationService.t('common.actions')"
                  >
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #rowMenu="matMenu">
                    <a mat-menu-item [routerLink]="['/posts-ads', post.id]">
                      <mat-icon>visibility</mat-icon>
                      <span>{{ translationService.t('dashboard.viewDetails') }}</span>
                    </a>
                    <a mat-menu-item [routerLink]="['/posts-ads/edit', post.id]">
                      <mat-icon>edit</mat-icon>
                      <span>{{ translationService.t('dashboard.editPost') }}</span>
                    </a>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          </div>
        }
      </mat-card-content>

      @if (!loading && posts.length && total > 0) {
        <app-pagination
          [currentPage]="page"
          [total]="total"
          [limit]="limit"
          [totalPages]="totalPages"
          (pageChange)="goTo($event)"
        ></app-pagination>
      }
    </mat-card>
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

  readonly displayedColumns = ['post', 'category', 'price', 'status', 'date', 'actions'];

  constructor(public translationService: TranslationService) {}

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.limit));
  }

  /** app-pagination already guards out-of-range and same-page clicks. */
  goTo(page: number) {
    this.pageChange.emit(page);
  }

  getImageUrl(post: PostAd): string {
    // API returns a complete CDN URL — used directly.
    return post.main_image_url ?? '';
  }

  /** One chip per row: pending warning, rejected error, active success, approved info. */
  statusChipClass(post: PostAd): string {
    if (post.review_status === 'pending') return 'app-chip-warning';
    if (post.review_status === 'rejected') return 'app-chip-error';
    return post.is_active === '1' ? 'app-chip-success' : 'app-chip-info';
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
