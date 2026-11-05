import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../shared/components/common/loading-spinner/loading-spinner.component';
import { PaginationComponent } from '../../shared/components/common/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../shared/components/common/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/components/common/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/common/error-state/error-state.component';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule, MatChipSelectionChange } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslationService } from '../../shared/services/translation.service';
import { PostsAdsService, PostAd } from '../../shared/services/data/posts-ads.service';
import { ErrorHandlerService } from '../../shared/services/api/error-handler.service';
import { SafeImageComponent } from '../../shared/components/common/safe-image/safe-image.component';
import { LookupService, Country } from '../../shared/services/data/lookup.service';
import { priceKind, PriceKind } from '../../shared/utils/price-display';
import { toFlag } from '../../shared/utils/verification';
export const REJECT_REASON_MAX = 500;

type StatusFilter = 'active' | 'inactive' | 'deleted' | 'all';
type ReviewFilter = 'all' | 'pending' | 'approved' | 'rejected';
const STATUS_FILTERS: StatusFilter[] = ['active', 'inactive', 'deleted', 'all'];
const REVIEW_FILTERS: ReviewFilter[] = ['all', 'pending', 'approved', 'rejected'];

@Component({
  selector: 'app-posts-ads',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    PaginationComponent,
    ConfirmDialogComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    SafeImageComponent,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './posts-ads.component.html',
})
export class PostsAdsComponent implements OnInit {
  posts: PostAd[] = [];
  displayedColumns = ['post', 'seller', 'price', 'reviewStatus', 'status', 'actions'];
  isLoading = false;
  errorMessage = '';

  currentPage = 1;
  limit = 20;
  total = 0;
  totalPages = 0;

  /** Filters the server-side `is_active` field */
  statusFilter: StatusFilter = 'all';
  /**
   * review_status filter. The API takes a single `status` value, so this is sent to the
   * server only while `statusFilter` is 'all'; otherwise it narrows the loaded page client-side.
   */
  reviewFilter: ReviewFilter = 'all';

  /** Server-side country filter (null = all countries). */
  countryId: number | null = null;
  countries: Country[] = [];

  readonly reasonMax = REJECT_REASON_MAX;

  // Dialog state
  deleteTarget: PostAd | null = null;
  approveTarget: PostAd | null = null;
  rejectTarget: PostAd | null = null;
  rejectReason = '';
  rejectError = '';
  actionProcessing = false;

  constructor(
    public translationService: TranslationService,
    private postsAdsService: PostsAdsService,
    private errorHandler: ErrorHandlerService,
    private lookupService: LookupService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const initial = this.route.snapshot.queryParamMap.get('status');
    if (REVIEW_FILTERS.includes(initial as ReviewFilter)) {
      this.reviewFilter = initial as ReviewFilter;
    } else if (STATUS_FILTERS.includes(initial as StatusFilter)) {
      this.statusFilter = initial as StatusFilter;
    }

    this.lookupService.getCountries().subscribe((countries) => {
      this.countries = countries;
    });
    this.loadPosts();
  }

  private get serverStatus(): StatusFilter | ReviewFilter {
    return this.statusFilter !== 'all' ? this.statusFilter : this.reviewFilter;
  }

  loadPosts() {
    this.isLoading = true;
    this.errorMessage = '';

    const langCode = this.translationService.currentLanguageValue;

    this.postsAdsService.listPosts({
      page: this.currentPage,
      limit: this.limit,
      langCode,
      status: this.serverStatus,
      countryId: this.countryId ?? undefined,
    }).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.posts = response.data.posts || [];
          this.total = response.data.pagination.total;
          this.totalPages = response.data.pagination.totalPages;
        }
        this.isLoading = false;
      },
      error: (error) => {
        const apiError = this.errorHandler.handleError(error);
        this.errorMessage = apiError.message;
        this.isLoading = false;
      }
    });
  }

  /** Posts filtered by review_status (client-side) */
  get filteredPosts(): PostAd[] {
    if (this.reviewFilter === 'all') return this.posts;
    return this.posts.filter(p => p.review_status === this.reviewFilter);
  }

  isActive(post: PostAd): boolean {
    return post.is_active === '1' || (post.is_active as any) === 1 || (post.is_active as any) === true;
  }

  isFeatured(post: PostAd): boolean {
    return post.is_featured === 1 || (post.is_featured as any) === true;
  }

  getImageUrl(post: PostAd): string {
    // API returns a complete CDN URL — used directly.
    return post.main_image_url ?? '';
  }

  priceKindOf(post: PostAd): PriceKind {
    return priceKind(post.price_type);
  }

  hasNumericPrice(post: PostAd): boolean {
    // A fixed price of zero is still a valid price.
    return post.price !== null && post.price !== undefined;
  }

  isBusinessSeller(post: PostAd): boolean {
    return post.sellerType === 'business';
  }

  identityVerified(post: PostAd): boolean {
    return toFlag(post.isIdentityVerified);
  }

  businessVerified(post: PostAd): boolean {
    return toFlag(post.isBusinessVerified);
  }

  getCreateDate(post: PostAd): Date | null {
    if (!post.create_date) return null;
    const ts = Number(post.create_date);
    return isNaN(ts) ? null : new Date(ts);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadPosts();
  }

  onStatusFilterChange(status: StatusFilter) {
    this.statusFilter = status;
    this.currentPage = 1;
    this.loadPosts();
  }

  onReviewFilterChange(filter: ReviewFilter) {
    this.reviewFilter = filter;
    if (this.statusFilter === 'all') {
      this.currentPage = 1;
      this.loadPosts();
    }
  }

  onCountryChange(countryId: number | null) {
    this.countryId = countryId;
    this.currentPage = 1;
    this.loadPosts();
  }

  /** Localized country name based on the active UI language. */
  countryName(country: Country): string {
    return this.translationService.currentLanguageValue === 'ar' ? country.name_ar : country.name_en;
  }

  /** Single-select chip groups: re-select the chip if the user clicks the active one. */
  pickStatus(event: MatChipSelectionChange, status: StatusFilter) {
    if (event.selected) {
      this.onStatusFilterChange(status);
    } else {
      event.source.select();
    }
  }

  pickReview(event: MatChipSelectionChange, filter: ReviewFilter) {
    if (event.selected) {
      this.onReviewFilterChange(filter);
    } else {
      event.source.select();
    }
  }

  // ---- Delete ----
  openDelete(post: PostAd) {
    this.deleteTarget = post;
  }

  confirmDelete() {
    if (!this.deleteTarget) return;
    this.actionProcessing = true;
    this.postsAdsService.deletePost({ postAdsId: this.deleteTarget.id }).subscribe({
      next: () => {
        this.actionProcessing = false;
        this.deleteTarget = null;
        this.loadPosts();
      },
      error: (error) => {
        this.actionProcessing = false;
        this.deleteTarget = null;
        this.errorMessage = this.errorHandler.handleError(error).message;
      }
    });
  }

  // ---- Approve ----
  openApprove(post: PostAd) {
    this.approveTarget = post;
  }

  confirmApprove() {
    if (!this.approveTarget) return;
    this.actionProcessing = true;
    this.postsAdsService.approvePost({ postAdsId: this.approveTarget.id }).subscribe({
      next: () => {
        this.actionProcessing = false;
        this.approveTarget = null;
        this.loadPosts();
      },
      error: (error) => {
        this.actionProcessing = false;
        this.approveTarget = null;
        this.errorMessage = this.errorHandler.handleError(error).message;
      }
    });
  }

  // ---- Reject ----
  openReject(post: PostAd) {
    this.rejectTarget = post;
    this.rejectReason = '';
    this.rejectError = '';
  }

  closeReject() {
    if (this.actionProcessing) return;
    this.rejectTarget = null;
    this.rejectReason = '';
    this.rejectError = '';
  }

  onRejectReasonChange(value: string) {
    this.rejectReason = value.slice(0, this.reasonMax);
    this.rejectError = '';
  }

  confirmReject() {
    if (!this.rejectTarget) return;
    const reason = this.rejectReason.trim();
    if (reason.length < 1 || reason.length > this.reasonMax) {
      this.rejectError = this.translationService.t('posts.rejectReasonInvalid');
      return;
    }
    this.actionProcessing = true;
    this.postsAdsService.rejectPost({ postAdsId: this.rejectTarget.id, reason }).subscribe({
      next: () => {
        this.actionProcessing = false;
        this.rejectTarget = null;
        this.rejectReason = '';
        this.loadPosts();
      },
      error: (error) => {
        this.actionProcessing = false;
        this.rejectError = this.errorHandler.handleError(error).message;
      }
    });
  }

  toggleActive(post: PostAd) {
    this.postsAdsService.updatePost({
      postAdsId: post.id,
      isActive: !this.isActive(post),
    }).subscribe({
      next: () => this.loadPosts(),
      error: (error) => {
        this.errorMessage = this.errorHandler.handleError(error).message;
      }
    });
  }

  toggleFeatured(post: PostAd) {
    this.postsAdsService.updatePost({
      postAdsId: post.id,
      isFeatured: !this.isFeatured(post),
    }).subscribe({
      next: () => this.loadPosts(),
      error: (error) => {
        this.errorMessage = this.errorHandler.handleError(error).message;
      }
    });
  }
}
