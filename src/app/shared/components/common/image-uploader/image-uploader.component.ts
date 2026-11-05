import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, Output, inject } from '@angular/core';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_FILE_SIZE,
  MediaUploadService,
  UploadType,
} from '../../../services/data/media-upload.service';
import { TranslationService } from '../../../services/translation.service';
import { SafeImageComponent } from '../safe-image/safe-image.component';

type UploadState = 'idle' | 'uploading' | 'uploaded' | 'error';

/**
 * Shared presigned-R2 image uploader.
 *
 * Flow: pick file → validate (jpeg/png/gif, max 5MB) → POST /media/upload-url
 * → PUT raw file to the signed URL (no auth) → emit `uploaded(storageKey)`
 * only after the PUT succeeds.
 *
 * Removal semantics are the parent's decision: `cleared` is emitted and the
 * parent decides whether to omit the field or send an explicit null.
 * The existing image is preserved until a replacement upload succeeds.
 */
@Component({
  selector: 'app-image-uploader',
  standalone: true,
  imports: [CommonModule, SafeImageComponent],
  template: `
    <div>
      @if (label) {
        <p class="mb-2 text-sm font-medium text-surface-on-surface">{{ label }}</p>
      }

      <div class="flex items-start gap-4">
        <!-- Preview -->
        <div class="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-outline-variant/40">
          @if (previewUrl) {
            <img [src]="previewUrl" alt="" class="h-full w-full object-cover" />
          } @else {
            <app-safe-image
              [src]="existingImageUrl"
              [imgClass]="'h-full w-full object-cover'"
              [placeholderClass]="'h-full w-full rounded-2xl'"
            ></app-safe-image>
          }
          @if (state === 'uploading') {
            <div class="absolute inset-0 flex items-center justify-center bg-black/40">
              <span class="h-6 w-6 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
            </div>
          }
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              (click)="fileInput.click()"
              [disabled]="state === 'uploading'"
              class="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/40 px-3 py-2 text-sm font-medium text-surface-on-surface-variant transition-colors hover:border-brand-400/60 hover:text-brand-600 disabled:opacity-50 dark:hover:text-brand-400"
            >
              {{ translationService.t(state === 'uploaded' || existingImageUrl ? 'uploader.changeImage' : 'uploader.chooseImage') }}
            </button>
            @if ((previewUrl || existingImageUrl) && showRemove) {
              <button
                type="button"
                (click)="clear()"
                [disabled]="state === 'uploading'"
                class="rounded-xl px-3 py-2 text-sm font-medium text-error-600 transition-colors hover:bg-error-50 disabled:opacity-50 dark:text-error-500 dark:hover:bg-error-500/10"
              >
                {{ translationService.t('uploader.removeImage') }}
              </button>
            }
            @if (state === 'error') {
              <button
                type="button"
                (click)="retry()"
                class="rounded-xl px-3 py-2 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-500/10 dark:text-brand-400"
              >
                {{ translationService.t('common.retry') }}
              </button>
            }
          </div>

          <input
            #fileInput
            type="file"
            class="hidden"
            [accept]="acceptAttr"
            (change)="onFileSelected($event)"
          />

          @if (state === 'uploading') {
            <p class="mt-2 text-xs text-surface-on-surface-variant">
              {{ translationService.t('uploader.uploading') }}
            </p>
          } @else if (state === 'uploaded') {
            <p class="mt-2 text-xs text-success-600 dark:text-success-500">
              {{ translationService.t('uploader.uploaded') }}
            </p>
          } @else if (state === 'error') {
            <p class="mt-2 text-xs text-error-600 dark:text-error-500">{{ errorMessage }}</p>
          } @else {
            <p class="mt-2 text-xs text-surface-on-surface-variant">
              {{ translationService.t('uploader.hint') }}
            </p>
          }
        </div>
      </div>
    </div>
  `,
})
export class ImageUploaderComponent implements OnDestroy {
  /** R2 upload type: category | ad | profile | business_logo | business_cover */
  @Input() type: UploadType = 'category';
  @Input() label = '';
  /** Existing saved image (CDN URL) shown until a replacement upload succeeds. */
  @Input() existingImageUrl: string | null | undefined;
  /** Whether the remove button is offered. The parent decides omit-vs-null semantics. */
  @Input() showRemove = true;

  /** Emitted only after the PUT succeeds. Never emitted on failure. */
  @Output() uploaded = new EventEmitter<string>();
  /** Emitted when the admin clears the selection/existing image. */
  @Output() cleared = new EventEmitter<void>();
  @Output() uploadingChange = new EventEmitter<boolean>();

  readonly translationService = inject(TranslationService);
  private readonly mediaUpload = inject(MediaUploadService);

  state: UploadState = 'idle';
  errorMessage = '';
  previewUrl: string | null = null;

  private pendingFile: File | null = null;

  get acceptAttr(): string {
    return ALLOWED_IMAGE_MIME_TYPES.join(',');
  }

  get maxSizeMb(): number {
    return Math.round(MAX_IMAGE_FILE_SIZE / 1_048_576);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    const validationError = this.mediaUpload.validateImageFile(file);
    if (validationError) {
      this.state = 'error';
      this.pendingFile = null;
      this.errorMessage = this.translationService.t(
        validationError === 'invalid_type' ? 'uploader.invalidType' : 'uploader.tooLarge'
      );
      return;
    }

    this.pendingFile = file;
    this.setPreview(file);
    this.startUpload();
  }

  retry(): void {
    if (this.pendingFile) {
      this.startUpload();
    }
  }

  clear(): void {
    this.pendingFile = null;
    this.revokePreview();
    this.state = 'idle';
    this.errorMessage = '';
    this.cleared.emit();
  }

  private startUpload(): void {
    const file = this.pendingFile;
    if (!file) return;

    this.state = 'uploading';
    this.errorMessage = '';
    this.uploadingChange.emit(true);

    this.mediaUpload.uploadImage(this.type, file).subscribe({
      next: (storageKey) => {
        this.state = 'uploaded';
        this.uploadingChange.emit(false);
        this.uploaded.emit(storageKey);
      },
      error: () => {
        this.state = 'error';
        this.uploadingChange.emit(false);
        // Keep the preview + pending file so the admin can retry.
        this.errorMessage = this.translationService.t('uploader.uploadFailed');
      },
    });
  }

  private setPreview(file: File): void {
    this.revokePreview();
    this.previewUrl = URL.createObjectURL(file);
  }

  private revokePreview(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }
  }

  ngOnDestroy(): void {
    this.revokePreview();
  }
}
