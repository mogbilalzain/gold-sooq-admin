import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../services/translation.service';
import { SafeHtmlPipe } from '../../../pipe/safe-html.pipe';

export interface AttentionItem {
  labelKey: string;
  count: number;
  route: string;
  queryParams?: Record<string, string>;
  icon: string;
  iconBgClass: string;
}

@Component({
  selector: 'app-attention-list',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeHtmlPipe],
  template: `
    <div class="dashboard-card h-full flex flex-col">
      <!-- Header -->
      <div class="mb-4">
        <h3 class="dashboard-card-title flex items-center gap-2">
          {{ translationService.t('dashboard.needsAttention') }}
          @if (totalCount) {
            <span
              class="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-warning-500/15 px-1.5 text-xs font-bold text-warning-600 dark:text-warning-400"
            >
              {{ totalCount }}
            </span>
          }
        </h3>
        <p class="dashboard-card-hint">
          {{ translationService.t('dashboard.needsAttentionHint') }}
        </p>
      </div>

      @if (loading) {
        <div class="animate-pulse space-y-3">
          @for (i of [1, 2, 3, 4]; track i) {
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 shrink-0 rounded-m3-md bg-surface-container-high"></div>
              <div class="h-3.5 flex-1 rounded bg-surface-container-high"></div>
              <div class="h-6 w-10 rounded-full bg-surface-container-high"></div>
            </div>
          }
        </div>
      } @else {
        <ul class="flex-1 divide-y divide-outline-variant/30">
          @for (item of items; track item.labelKey) {
            <li>
              <a
                [routerLink]="item.route"
                [queryParams]="item.queryParams"
                class="state-layer -mx-2 flex items-center gap-3 rounded-m3-md px-2 py-3"
              >
                <span
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-m3-md"
                  [ngClass]="item.iconBgClass"
                  [innerHTML]="item.icon | safeHtml"
                ></span>
                <span class="min-w-0 flex-1 truncate text-sm font-medium text-surface-on-surface">
                  {{ translationService.t(item.labelKey) }}
                </span>
                @if (item.count > 0) {
                  <span class="status-pill status-pill-warning shrink-0">
                    {{ item.count }}
                  </span>
                } @else {
                  <span
                    class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-success-wash)] text-[color:var(--color-success-wash-text)]"
                    [innerHTML]="checkIcon | safeHtml"
                  ></span>
                }
                <svg
                  class="attention-chevron"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </a>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class AttentionListComponent {
  @Input() items: AttentionItem[] = [];
  @Input() loading = false;

  readonly checkIcon =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';

  constructor(public translationService: TranslationService) {}

  get totalCount(): number {
    return this.items.reduce((sum, item) => sum + (item.count || 0), 0);
  }
}
