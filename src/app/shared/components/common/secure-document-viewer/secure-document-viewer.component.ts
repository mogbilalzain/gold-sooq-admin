import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, inject } from '@angular/core';
import { TranslationService } from '../../../services/translation.service';

export interface SecureDocument {
  url: string;
  expiresAt?: string;
}

/**
 * Viewer for short-lived signed document URLs (KYC / business documents,
 * ~120 s lifetime).
 *
 * - Shows a countdown based on `expiresAt` and an explicit refresh action.
 * - On an image load failure after expiry, auto-refreshes at most once
 *   (bounded; no refetch loops), then requires manual refresh.
 * - URLs live only in this component's memory: never persisted, never put
 *   in route params, logs, or analytics.
 */
@Component({
  selector: 'app-secure-document-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl border border-outline-variant/40 overflow-hidden">
      <div class="flex items-center justify-between gap-2 border-b border-outline-variant/30 px-3 py-2">
        <p class="text-sm font-medium text-surface-on-surface">{{ label }}</p>
        <div class="flex items-center gap-2">
          @if (!expired && secondsLeft !== null) {
            <span
              class="text-xs tabular-nums"
              [class.text-warning-600]="secondsLeft <= 30"
              [class.text-surface-on-surface-variant]="secondsLeft > 30"
            >
              {{ secondsLeft }}s
            </span>
          }
          <button
            type="button"
            (click)="requestRefresh(false)"
            class="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-500/10 dark:text-brand-400"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6"/>
            </svg>
            {{ translationService.t('docViewer.refresh') }}
          </button>
        </div>
      </div>

      <div class="bg-surface-container-low">
        @if (!doc?.url) {
          <div class="flex h-40 items-center justify-center text-sm text-surface-on-surface-variant">
            {{ translationService.t('docViewer.missing') }}
          </div>
        } @else if (expired) {
          <div class="flex h-40 flex-col items-center justify-center gap-2 text-sm text-surface-on-surface-variant">
            <p>{{ translationService.t('docViewer.expired') }}</p>
            <button
              type="button"
              (click)="requestRefresh(false)"
              class="rounded-xl border border-outline-variant/40 px-3 py-1.5 text-xs font-medium text-brand-600 hover:border-brand-400/60 dark:text-brand-400"
            >
              {{ translationService.t('docViewer.refresh') }}
            </button>
          </div>
        } @else if (loadFailed) {
          <div class="flex h-40 flex-col items-center justify-center gap-2 text-sm text-surface-on-surface-variant">
            <p>{{ translationService.t('docViewer.loadFailed') }}</p>
            <button
              type="button"
              (click)="requestRefresh(false)"
              class="rounded-xl border border-outline-variant/40 px-3 py-1.5 text-xs font-medium text-brand-600 hover:border-brand-400/60 dark:text-brand-400"
            >
              {{ translationService.t('docViewer.refresh') }}
            </button>
          </div>
        } @else {
          <a [href]="doc!.url" target="_blank" rel="noopener noreferrer" class="block">
            <img
              [src]="doc!.url"
              [alt]="label"
              class="mx-auto max-h-80 w-auto object-contain"
              (error)="onImageError()"
            />
          </a>
        }
      </div>
    </div>
  `,
})
export class SecureDocumentViewerComponent implements OnChanges, OnDestroy {
  @Input() label = '';
  @Input() doc: SecureDocument | null | undefined;

  /** Parent should re-call getById and pass fresh viewUrls back in. */
  @Output() refreshRequested = new EventEmitter<void>();

  readonly translationService = inject(TranslationService);

  expired = false;
  loadFailed = false;
  secondsLeft: number | null = null;

  private autoRetried = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['doc']) {
      this.loadFailed = false;
      this.expired = false;
      this.autoRetried = false;
      this.startCountdown();
    }
  }

  onImageError(): void {
    // Bounded recovery: if the link likely expired, refresh once automatically.
    if (!this.autoRetried && this.isExpiredByTime()) {
      this.autoRetried = true;
      this.requestRefresh(true);
      return;
    }
    this.loadFailed = true;
  }

  requestRefresh(_automatic: boolean): void {
    this.refreshRequested.emit();
  }

  private isExpiredByTime(): boolean {
    if (!this.doc?.expiresAt) return false;
    const expiry = new Date(this.doc.expiresAt).getTime();
    return !isNaN(expiry) && expiry <= Date.now();
  }

  private startCountdown(): void {
    this.stopCountdown();
    if (!this.doc?.expiresAt) {
      this.secondsLeft = null;
      return;
    }
    const tick = () => {
      const expiry = new Date(this.doc!.expiresAt!).getTime();
      if (isNaN(expiry)) {
        this.secondsLeft = null;
        return;
      }
      const left = Math.max(0, Math.round((expiry - Date.now()) / 1000));
      this.secondsLeft = left;
      if (left <= 0) {
        this.expired = true;
        this.stopCountdown();
      }
    };
    tick();
    this.intervalId = setInterval(tick, 1000);
  }

  private stopCountdown(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  ngOnDestroy(): void {
    this.stopCountdown();
  }
}
