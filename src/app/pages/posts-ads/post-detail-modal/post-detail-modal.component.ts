import {
  Component, Input, Output, EventEmitter, OnChanges, SimpleChanges,
  TemplateRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { PostAd } from '../../../shared/services/data/posts-ads.service';
import { TranslationService } from '../../../shared/services/translation.service';

/**
 * Post details dialog. Public API is unchanged (`open`, `post`, `closed`,
 * `approve`, `reject`) — the internals are a MatDialog driven from an
 * ng-template, so backdrop/escape/focus handling comes from the CDK overlay.
 */
@Component({
  selector: 'app-post-detail-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
<ng-template #detailDialog>
  @if (post) {
    <div class="relative flex max-h-[90vh] w-full flex-col bg-[color:var(--color-surface-container-lowest)] text-[color:var(--color-on-surface)] dark:bg-[color:var(--color-surface-container-high)]">
      <!-- Header -->
      <div class="flex items-center justify-between gap-4 border-b border-[color:var(--color-outline-variant)]/40 px-6 py-4">
        <h2 class="text-m3-headline-sm font-normal text-[color:var(--color-on-surface)] line-clamp-1">
          {{ post.post_title }}
        </h2>
        <button
          mat-icon-button
          (click)="close()"
          [attr.aria-label]="t('common.close')"
          class="!text-[color:var(--color-on-surface-variant)] flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-6">

        <!-- Image gallery -->
        @if (post.images && post.images.length > 0) {
          <div>
            <!-- Main selected image -->
            <div class="relative overflow-hidden rounded-xl bg-[color:var(--color-surface-container)] aspect-video flex items-center justify-center">
              <img
                [src]="selectedImageUrl"
                [alt]="post.post_title"
                class="h-full w-full object-contain"
                (error)="onImgError($event)"
              />
              @if (post.images.length > 1) {
                <button (click)="prevImage()"
                  class="absolute start-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-9 w-9
                         rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
                <button (click)="nextImage()"
                  class="absolute end-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-9 w-9
                         rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <span class="absolute bottom-3 end-3 rounded-full bg-black/50 px-2.5 py-0.5 text-xs text-white">
                  {{ selectedIndex + 1 }} / {{ post.images.length }}
                </span>
              }
            </div>

            <!-- Thumbnails -->
            @if (post.images.length > 1) {
              <div class="mt-3 flex gap-2 overflow-x-auto pb-1">
                @for (img of post.images; track img.id; let i = $index) {
                  <button
                    (click)="selectImage(i)"
                    class="flex-shrink-0 h-16 w-16 overflow-hidden rounded-lg border-2 transition-all"
                    [class.border-brand-500]="selectedIndex === i"
                    [class.border-transparent]="selectedIndex !== i">
                    <img
                      [src]="buildImageUrl(img.url)"
                      [alt]="'image ' + (i+1)"
                      class="h-full w-full object-cover"
                      (error)="onImgError($event)"
                    />
                  </button>
                }
              </div>
            }
          </div>
        }

        <!-- Info grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <!-- Price -->
          <div class="detail-card">
            <span class="detail-label">{{ t('posts.price') }}</span>
            <span class="detail-value text-brand-700 dark:text-brand-400 font-bold text-lg">
              @if (post.price) {
                {{ post.price | number }} <span class="text-sm font-normal text-[color:var(--color-on-surface-variant)]">{{ post.currency }}</span>
              } @else {
                —
              }
            </span>
          </div>

          <!-- Category -->
          <div class="detail-card">
            <span class="detail-label">{{ t('posts.category') }}</span>
            <span class="detail-value">{{ post.categoryName || '—' }}</span>
          </div>

          <!-- Country / State -->
          <div class="detail-card">
            <span class="detail-label">{{ t('posts.location') }}</span>
            <span class="detail-value">
              {{ post.countryName || '—' }}
              @if (post.stateName) { · {{ post.stateName }} }
            </span>
          </div>

          <!-- Date -->
          <div class="detail-card">
            <span class="detail-label">{{ t('common.date') }}</span>
            <span class="detail-value">{{ getCreateDate() | date:'dd/MM/yyyy HH:mm' }}</span>
          </div>

          <!-- Active status -->
          <div class="detail-card">
            <span class="detail-label">{{ t('posts.status') }}</span>
            <span class="status-pill"
              [class.status-pill-success]="isActive()"
              [class.status-pill-warning]="!isActive()">
              {{ isActive() ? t('posts.active') : t('posts.inactive') }}
            </span>
          </div>

          <!-- Featured -->
          <div class="detail-card">
            <span class="detail-label">{{ t('posts.featured') }}</span>
            <span class="status-pill"
              [class.status-pill-info]="isFeatured()"
              [class.status-pill-warning]="!isFeatured()">
              {{ isFeatured() ? t('posts.yes') : t('posts.no') }}
            </span>
          </div>

          <!-- Review status -->
          <div class="detail-card sm:col-span-2">
            <span class="detail-label">{{ t('posts.reviewStatus') }}</span>
            <span class="status-pill"
              [class.status-pill-warning]="post.review_status === 'pending'"
              [class.status-pill-success]="post.review_status === 'approved'"
              [class.status-pill-error]="post.review_status === 'rejected'">
              {{ t('posts.' + (post.review_status || 'pending')) }}
            </span>
          </div>

          <!-- Reject reason -->
          @if (post.review_status === 'rejected' && post.reject_reason) {
            <div class="detail-card sm:col-span-2">
              <span class="detail-label">{{ t('posts.rejectReason') }}</span>
              <span class="detail-value text-error-600 dark:text-error-400">{{ post.reject_reason }}</span>
            </div>
          }

        </div>

        <!-- Divider -->
        <hr class="border-[color:var(--color-outline-variant)]/40"/>

        <!-- Seller info -->
        <div>
          <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-[color:var(--color-on-surface-variant)]">
            {{ t('posts.seller') }}
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="detail-card">
              <span class="detail-label">{{ t('users.name') }}</span>
              <span class="detail-value font-medium">{{ post.user_name || '—' }}</span>
            </div>
            <div class="detail-card">
              <span class="detail-label">{{ t('users.email') }}</span>
              <span class="detail-value break-all">{{ post.user_email || '—' }}</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Footer actions -->
      <div class="flex justify-end gap-2 border-t border-[color:var(--color-outline-variant)]/40 px-6 py-4">
        <button matButton="text" (click)="close()">
          {{ t('common.close') }}
        </button>
        @if (post.review_status === 'pending') {
          <button matButton="filled" class="app-btn-danger" (click)="emitReject()">
            {{ t('posts.reject') }}
          </button>
          <button matButton="filled" class="app-btn-success" (click)="emitApprove()">
            {{ t('posts.approve') }}
          </button>
        }
        @if (post.review_status === 'approved') {
          <button matButton="filled" class="app-btn-danger" (click)="emitReject()">
            {{ t('posts.reject') }}
          </button>
        }
        @if (post.review_status === 'rejected') {
          <button matButton="filled" class="app-btn-success" (click)="emitApprove()">
            {{ t('posts.approve') }}
          </button>
        }
      </div>
    </div>
  }
</ng-template>
  `,
  styles: [`
    .detail-card {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 12px 14px;
      border-radius: 12px;
      background: var(--color-surface-container-low, #f5f5f5);
    }
    :host-context(.dark) .detail-card {
      background: color-mix(in srgb, var(--color-surface-container) 80%, transparent);
    }
    .detail-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--color-on-surface-variant);
    }
    .detail-value {
      font-size: 14px;
      color: var(--color-on-surface);
    }
  `]
})
export class PostDetailModalComponent implements OnChanges {
  @Input() open = false;
  @Input() post: PostAd | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() approve = new EventEmitter<PostAd>();
  @Output() reject = new EventEmitter<PostAd>();

  @ViewChild('detailDialog') detailDialog!: TemplateRef<unknown>;
  private dialogRef: MatDialogRef<unknown> | null = null;

  selectedIndex = 0;

  constructor(
    public translationService: TranslationService,
    private dialog: MatDialog
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['post'] || changes['open']) {
      this.selectedIndex = 0;
    }
    if (changes['open']) {
      if (this.open && this.post && !this.dialogRef) {
        this.dialogRef = this.dialog.open(this.detailDialog, {
          width: '672px',
          panelClass: 'app-dialog-flush',
        });
        this.dialogRef.afterClosed().subscribe(() => {
          this.dialogRef = null;
          // If the parent still considers the modal open, tell it we closed.
          if (this.open) this.closed.emit();
        });
      } else if (!this.open && this.dialogRef) {
        this.dialogRef.close();
      }
    }
    if (changes['post'] && !this.post && this.dialogRef) {
      this.dialogRef.close();
    }
  }

  t(key: string): string {
    return this.translationService.t(key as any);
  }

  close() {
    this.dialogRef?.close();
  }

  get selectedImageUrl(): string {
    if (!this.post?.images?.length) return '';
    const img = this.post.images[this.selectedIndex];
    return this.buildImageUrl(img.url);
  }

  buildImageUrl(url: string): string {
    // API returns complete CDN URLs — used directly.
    return url ?? '';
  }

  selectImage(index: number) {
    this.selectedIndex = index;
  }

  nextImage() {
    if (!this.post?.images?.length) return;
    this.selectedIndex = (this.selectedIndex + 1) % this.post.images.length;
  }

  prevImage() {
    if (!this.post?.images?.length) return;
    this.selectedIndex = (this.selectedIndex - 1 + this.post.images.length) % this.post.images.length;
  }

  onImgError(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  isActive(): boolean {
    return this.post?.is_active === '1' || (this.post?.is_active as any) === 1;
  }

  isFeatured(): boolean {
    return this.post?.is_featured === 1;
  }

  getCreateDate(): Date | null {
    if (!this.post?.create_date) return null;
    const ts = Number(this.post.create_date);
    return isNaN(ts) ? null : new Date(ts);
  }

  emitApprove() {
    if (this.post) { this.approve.emit(this.post); this.close(); }
  }

  emitReject() {
    if (this.post) { this.reject.emit(this.post); this.close(); }
  }
}
