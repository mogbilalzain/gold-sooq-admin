import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription, switchMap } from 'rxjs';
import { PageHeaderComponent } from '../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/common/loading-spinner/loading-spinner.component';
import { ErrorStateComponent } from '../../../shared/components/common/error-state/error-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/common/confirm-dialog/confirm-dialog.component';
import { SafeImageComponent } from '../../../shared/components/common/safe-image/safe-image.component';
import { TranslationService } from '../../../shared/services/translation.service';
import { PostsAdsService, PostAdDetails } from '../../../shared/services/data/posts-ads.service';
import { ErrorHandlerService } from '../../../shared/services/api/error-handler.service';
import { priceKind, PriceKind } from '../../../shared/utils/price-display';
import { toFlag } from '../../../shared/utils/verification';

const REJECT_REASON_MAX = 500;

/**
 * Full ad details page (/posts-ads/:id) — loads /admin/posts-ads/getById.
 * Route-param driven with switchMap so a stale response never overwrites
 * the currently selected ad.
 */
@Component({
  selector: 'app-post-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    ErrorStateComponent,
    ConfirmDialogComponent,
    SafeImageComponent,
  ],
  template: `
    <app-page-header
      [title]="translationService.t('postDetails.title')"
      [subtitle]="translationService.t('postDetails.subtitle')">
      <a routerLink="/posts-ads"
         class="modern-button modern-button-secondary px-4 text-m3-label-lg">
        {{ translationService.t('postDetails.backToList') }}
      </a>
    </app-page-header>

    @if (isLoading) {
      <app-loading-spinner />
    } @else if (errorMessage) {
      <div class="modern-card">
        <app-error-state [message]="errorMessage" (retry)="reload()" />
      </div>
    } @else if (post) {
      <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <!-- Main column -->
        <div class="space-y-6 xl:col-span-2">
          <!-- Images -->
          <div class="modern-card !p-5">
            <h3 class="mb-4 text-m3-title-md font-semibold text-[color:var(--color-on-surface)]">
              {{ translationService.t('postDetails.images') }}
            </h3>
            @if (selectedImage) {
              <img [src]="selectedImage" [alt]="post.post_title"
                   class="mx-auto max-h-96 rounded-2xl object-contain" />
            } @else {
              <div class="flex h-48 items-center justify-center rounded-2xl bg-surface-container-high text-sm text-surface-on-surface-variant">
                {{ translationService.t('postDetails.noImages') }}
              </div>
            }
            @if (allImages.length > 1) {
              <div class="mt-4 flex flex-wrap gap-2">
                @for (img of allImages; track img; let i = $index) {
                  <button type="button" (click)="selectedIndex = i"
                          class="h-16 w-16 overflow-hidden rounded-xl border-2 transition-colors"
                          [class.border-brand-500]="selectedIndex === i"
                          [class.border-transparent]="selectedIndex !== i">
                    <img [src]="img" alt="" class="h-full w-full object-cover" />
                  </button>
                }
              </div>
            }
          </div>

          <!-- Content -->
          <div class="modern-card !p-5">
            <h3 class="mb-2 text-m3-title-lg font-semibold text-[color:var(--color-on-surface)]">{{ post.post_title }}</h3>
            <p class="whitespace-pre-line text-sm leading-relaxed text-[color:var(--color-on-surface-variant)]">
              {{ post.post_detail || '—' }}
            </p>
          </div>

          <!-- Attributes -->
          @if (post.attributes?.length) {
            <div class="modern-card !p-5">
              <h3 class="mb-4 text-m3-title-md font-semibold text-[color:var(--color-on-surface)]">
                {{ translationService.t('postDetails.attributes') }}
              </h3>
              <dl class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                @for (attr of post.attributes; track attr.name) {
                  <div class="rounded-xl bg-surface-container-low p-3 dark:bg-surface-container-high/40">
                    <dt class="text-xs text-[color:var(--color-on-surface-variant)]">{{ attr.name }}</dt>
                    <dd class="mt-0.5 text-sm font-semibold text-[color:var(--color-on-surface)]">
                      {{ attr.value }}@if (attr.unit) { <span class="text-xs font-normal">{{ attr.unit }}</span> }
                    </dd>
                  </div>
                }
              </dl>
            </div>
          }
        </div>

        <!-- Side column -->
        <div class="space-y-6">
          <!-- Price -->
          <div class="modern-card !p-5">
            <h3 class="mb-3 text-m3-title-md font-semibold text-[color:var(--color-on-surface)]">
              {{ translationService.t('posts.price') }}
            </h3>
            @if (priceKindOf() === 'market') {
              <span class="rounded-full bg-brand-500/10 px-3 py-1.5 text-sm font-semibold text-brand-700 dark:text-brand-400">
                {{ translationService.t('posts.priceMarket') }}
              </span>
            } @else if (priceKindOf() === 'contact') {
              <span class="rounded-full bg-surface-container-high px-3 py-1.5 text-sm font-semibold text-[color:var(--color-on-surface-variant)]">
                {{ translationService.t('posts.priceContact') }}
              </span>
            } @else if (hasNumericPrice()) {
              <p class="text-m3-headline-sm font-semibold text-brand-700 dark:text-brand-300">
                {{ post.price | number }}
                <span class="text-sm font-normal text-[color:var(--color-on-surface-variant)]">{{ post.currency }}</span>
              </p>
            } @else {
              <p class="text-[color:var(--color-outline)]">—</p>
            }
          </div>

          <!-- Status -->
          <div class="modern-card !p-5">
            <h3 class="mb-3 text-m3-title-md font-semibold text-[color:var(--color-on-surface)]">
              {{ translationService.t('postDetails.statusTitle') }}
            </h3>
            <dl class="space-y-2.5 text-sm">
              <div class="flex items-center justify-between gap-2">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('posts.reviewStatus') }}</dt>
                <dd>
                  <span class="status-pill"
                        [class.status-pill-warning]="post.review_status === 'pending'"
                        [class.status-pill-success]="post.review_status === 'approved'"
                        [class.status-pill-error]="post.review_status === 'rejected'">
                    {{ translationService.t('posts.' + (post.review_status || 'pending')) }}
                  </span>
                </dd>
              </div>
              @if (post.review_status === 'rejected' && post.reject_reason) {
                <div>
                  <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('posts.rejectReason') }}</dt>
                  <dd class="mt-1 text-error-600 dark:text-error-400">{{ post.reject_reason }}</dd>
                </div>
              }
              @if (formatDate(post.reviewed_at)) {
                <div class="flex items-center justify-between gap-2">
                  <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('postDetails.reviewedAt') }}</dt>
                  <dd class="text-[color:var(--color-on-surface)]">{{ formatDate(post.reviewed_at) }}</dd>
                </div>
              }
              <div class="flex items-center justify-between gap-2">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('posts.isActive') }}</dt>
                <dd class="text-[color:var(--color-on-surface)]">
                  {{ translationService.t(isActive() ? 'posts.active' : 'posts.inactive') }}
                </dd>
              </div>
              <div class="flex items-center justify-between gap-2">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('posts.isFeatured') }}</dt>
                <dd class="text-[color:var(--color-on-surface)]">
                  {{ translationService.t(isFeatured() ? 'posts.yes' : 'posts.no') }}
                </dd>
              </div>
              @if (post.inactive_reason) {
                <div class="flex items-center justify-between gap-2">
                  <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('postDetails.inactiveReason') }}</dt>
                  <dd class="text-[color:var(--color-on-surface)]">{{ post.inactive_reason }}</dd>
                </div>
              }
              @if (formatDate(post.post_end_date)) {
                <div class="flex items-center justify-between gap-2">
                  <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('postDetails.endDate') }}</dt>
                  <dd class="text-[color:var(--color-on-surface)]">{{ formatDate(post.post_end_date) }}</dd>
                </div>
              }
              @if (post.deleted_at) {
                <div class="flex items-center justify-between gap-2">
                  <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('postDetails.deletedAt') }}</dt>
                  <dd class="text-error-600 dark:text-error-400">{{ formatDate(post.deleted_at) }}</dd>
                </div>
              }
            </dl>

            <!-- Moderation -->
            @if (post.review_status === 'pending') {
              <div class="mt-4 flex gap-2 border-t border-outline-variant/30 pt-4">
                <button type="button" (click)="approveOpen = true"
                        class="state-layer h-10 flex-1 rounded-full bg-success-600 px-4 text-m3-label-lg font-medium text-white hover:shadow-elevation-1">
                  {{ translationService.t('posts.approve') }}
                </button>
                <button type="button" (click)="openReject()"
                        class="state-layer h-10 flex-1 rounded-full bg-[color:var(--color-error)] px-4 text-m3-label-lg font-medium text-[color:var(--color-on-error)] hover:shadow-elevation-1">
                  {{ translationService.t('posts.reject') }}
                </button>
              </div>
            }
          </div>

          <!-- Classification + location -->
          <div class="modern-card !p-5">
            <h3 class="mb-3 text-m3-title-md font-semibold text-[color:var(--color-on-surface)]">
              {{ translationService.t('postDetails.classification') }}
            </h3>
            <dl class="space-y-2.5 text-sm">
              <div class="flex items-center justify-between gap-2">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('posts.category') }}</dt>
                <dd class="text-[color:var(--color-on-surface)]">
                  {{ post.parentCategoryName ? post.parentCategoryName + ' › ' : '' }}{{ post.categoryName || '—' }}
                </dd>
              </div>
              <div class="flex items-center justify-between gap-2">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('posts.location') }}</dt>
                <dd class="text-[color:var(--color-on-surface)]">
                  {{ post.countryName || '—' }}@if (post.stateName) { · {{ post.stateName }} }
                </dd>
              </div>
              @if (post.address_line) {
                <div class="flex items-center justify-between gap-2">
                  <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('postDetails.address') }}</dt>
                  <dd class="text-[color:var(--color-on-surface)]">{{ post.address_line }}</dd>
                </div>
              }
              @if (formatDate(post.create_date)) {
                <div class="flex items-center justify-between gap-2">
                  <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('common.date') }}</dt>
                  <dd class="text-[color:var(--color-on-surface)]">{{ formatDate(post.create_date) }}</dd>
                </div>
              }
            </dl>
          </div>

          <!-- Owner -->
          <div class="modern-card !p-5">
            <h3 class="mb-3 text-m3-title-md font-semibold text-[color:var(--color-on-surface)]">
              {{ translationService.t('postDetails.owner') }}
            </h3>
            <div class="flex items-center gap-3">
              <app-safe-image
                [src]="ownerAvatar"
                [alt]="ownerName"
                imgClass="h-11 w-11 rounded-full object-cover"
                placeholderClass="h-11 w-11 rounded-full text-sm"
                [placeholderText]="ownerName.charAt(0) || '؟'"
              />
              <div class="min-w-0">
                <p class="flex items-center gap-1.5 text-sm font-semibold text-[color:var(--color-on-surface)]">
                  <span class="truncate">{{ ownerName }}</span>
                  @if (businessVerified()) {
                    <span class="inline-flex shrink-0 text-brand-500" [title]="translationService.t('posts.businessVerified')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2 4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1.06 13.54L7.4 12l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41-5.64 5.66z"/></svg>
                    </span>
                  } @else if (identityVerified()) {
                    <span class="inline-flex shrink-0 text-success-500" [title]="translationService.t('posts.identityVerified')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2 4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1.06 13.54L7.4 12l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41-5.64 5.66z"/></svg>
                    </span>
                  }
                </p>
                <p class="text-xs text-[color:var(--color-on-surface-variant)]">
                  {{ translationService.t(isBusinessSeller() ? 'posts.sellerBusiness' : 'posts.sellerIndividual') }}
                </p>
              </div>
            </div>
            <dl class="mt-3 space-y-1.5 text-xs text-[color:var(--color-on-surface-variant)]">
              @if (post.userPhone) { <div dir="ltr" class="text-start">{{ post.userPhone }}</div> }
              @if (post.userEmail) { <div dir="ltr" class="text-start">{{ post.userEmail }}</div> }
            </dl>
            @if (ownerId) {
              <a [routerLink]="['/users', ownerId]"
                 class="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                {{ translationService.t('postDetails.viewOwnerProfile') }}
              </a>
            }
          </div>
        </div>
      </div>
    }

    <!-- Approve confirmation -->
    <app-confirm-dialog
      [open]="approveOpen"
      [title]="translationService.t('posts.confirmApproveTitle')"
      [message]="(post?.post_title || '') + ' — ' + translationService.t('posts.confirmApprove')"
      [confirmLabel]="translationService.t('posts.approve')"
      [processing]="actionProcessing"
      (confirmed)="confirmApprove()"
      (cancelled)="approveOpen = false"
    ></app-confirm-dialog>

    <!-- Reject with reason -->
    <app-confirm-dialog
      [open]="rejectOpen"
      variant="destructive"
      [title]="translationService.t('posts.confirmRejectTitle')"
      [message]="post?.post_title || ''"
      [confirmLabel]="translationService.t('posts.reject')"
      [processing]="actionProcessing"
      (confirmed)="confirmReject()"
      (cancelled)="closeReject()"
    >
      <div class="mt-4">
        <label class="mb-1.5 block text-sm font-semibold text-[color:var(--color-on-surface)]">
          {{ translationService.t('posts.rejectReason') }} <span class="text-error-500">*</span>
        </label>
        <textarea
          rows="3"
          [value]="rejectReason"
          (input)="onRejectReasonChange($any($event.target).value)"
          [disabled]="actionProcessing"
          [placeholder]="translationService.t('posts.rejectReasonPlaceholder')"
          class="form-input py-3 text-sm"
        ></textarea>
        <div class="mt-1 flex items-center justify-between text-xs">
          @if (rejectError) {
            <span class="text-error-500">{{ rejectError }}</span>
          } @else {
            <span></span>
          }
          <span class="text-[color:var(--color-on-surface-variant)]">{{ rejectReason.length }} / {{ rejectReasonMax }}</span>
        </div>
      </div>
    </app-confirm-dialog>
  `,
})
export class PostDetailsComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly postsAdsService = inject(PostsAdsService);
  private readonly errorHandler = inject(ErrorHandlerService);
  readonly translationService = inject(TranslationService);

  post: PostAdDetails | null = null;
  isLoading = true;
  errorMessage = '';
  selectedIndex = 0;

  approveOpen = false;
  rejectOpen = false;
  rejectReason = '';
  rejectError = '';
  actionProcessing = false;
  readonly rejectReasonMax = REJECT_REASON_MAX;

  private subscription?: Subscription;
  private currentId: number | null = null;

  ngOnInit(): void {
    // switchMap discards a stale response when the id changes.
    this.subscription = this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.currentId = Number(params.get('id'));
          this.isLoading = true;
          this.errorMessage = '';
          this.post = null;
          this.selectedIndex = 0;
          return this.postsAdsService.getPostById(
            this.currentId,
            this.translationService.currentLanguageValue
          );
        })
      )
      .subscribe({
        next: (response) => {
          this.post = response.data ?? null;
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = this.errorHandler.getErrorMessage(error);
          this.isLoading = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  reload(): void {
    if (this.currentId === null) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.postsAdsService
      .getPostById(this.currentId, this.translationService.currentLanguageValue)
      .subscribe({
        next: (response) => {
          this.post = response.data ?? null;
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = this.errorHandler.getErrorMessage(error);
          this.isLoading = false;
        },
      });
  }

  get allImages(): string[] {
    if (!this.post) return [];
    const urls: string[] = [];
    if (this.post.main_image_url) urls.push(this.post.main_image_url);
    for (const img of this.post.images ?? []) {
      if (img.url && !urls.includes(img.url)) urls.push(img.url);
    }
    return urls;
  }

  get selectedImage(): string {
    return this.allImages[this.selectedIndex] ?? '';
  }

  get ownerId(): number | null {
    return this.post?.userId ?? this.post?.user_account_id ?? null;
  }

  get ownerName(): string {
    if (!this.post) return '';
    return this.post.tradeName || this.post.userName || this.post.user_name || '—';
  }

  get ownerAvatar(): string | null {
    if (!this.post) return null;
    return this.isBusinessSeller()
      ? this.post.logoUrl ?? null
      : this.post.userProfileImageUrl ?? null;
  }

  priceKindOf(): PriceKind {
    return priceKind(this.post?.price_type);
  }

  hasNumericPrice(): boolean {
    return this.post?.price !== null && this.post?.price !== undefined;
  }

  isActive(): boolean {
    return this.post?.is_active === '1' || (this.post?.is_active as unknown) === 1;
  }

  isFeatured(): boolean {
    return toFlag(this.post?.is_featured);
  }

  isBusinessSeller(): boolean {
    return this.post?.sellerType === 'business';
  }

  identityVerified(): boolean {
    return toFlag(this.post?.isIdentityVerified);
  }

  businessVerified(): boolean {
    return toFlag(this.post?.isBusinessVerified);
  }

  formatDate(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') return '';
    let date: Date;
    if (typeof value === 'number' || /^\d+$/.test(String(value))) {
      const ts = Number(value);
      // Seconds vs milliseconds epoch.
      date = new Date(ts < 1e12 ? ts * 1000 : ts);
    } else {
      date = new Date(value);
    }
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString(
      this.translationService.currentLanguageValue === 'ar' ? 'ar-SA' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );
  }

  confirmApprove(): void {
    if (!this.post || this.actionProcessing) return;
    this.actionProcessing = true;
    this.postsAdsService.approvePost({ postAdsId: this.post.id }).subscribe({
      next: () => {
        this.actionProcessing = false;
        this.approveOpen = false;
        this.reload();
      },
      error: (error) => {
        this.actionProcessing = false;
        this.approveOpen = false;
        this.errorMessage = this.errorHandler.getErrorMessage(error);
      },
    });
  }

  openReject(): void {
    this.rejectReason = '';
    this.rejectError = '';
    this.rejectOpen = true;
  }

  closeReject(): void {
    if (this.actionProcessing) return;
    this.rejectOpen = false;
    this.rejectReason = '';
    this.rejectError = '';
  }

  onRejectReasonChange(value: string): void {
    this.rejectReason = value.slice(0, this.rejectReasonMax);
    this.rejectError = '';
  }

  confirmReject(): void {
    if (!this.post || this.actionProcessing) return;
    const reason = this.rejectReason.trim();
    if (reason.length < 1 || reason.length > this.rejectReasonMax) {
      this.rejectError = this.translationService.t('posts.rejectReasonInvalid');
      return;
    }
    this.actionProcessing = true;
    this.postsAdsService.rejectPost({ postAdsId: this.post.id, reason }).subscribe({
      next: () => {
        this.actionProcessing = false;
        this.rejectOpen = false;
        this.rejectReason = '';
        this.reload();
      },
      error: (error) => {
        this.actionProcessing = false;
        this.rejectError = this.errorHandler.getErrorMessage(error);
      },
    });
  }
}
