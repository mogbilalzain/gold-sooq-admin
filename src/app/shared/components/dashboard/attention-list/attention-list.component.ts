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
    <div class="dashboard-card flex h-full flex-col">
      <!-- Header: amber count box + title -->
      <div class="mb-5 flex items-center gap-3">
        <span
          class="ayar-num flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-base font-extrabold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
        >
          {{ totalCount }}
        </span>
        <div class="min-w-0">
          <h3 class="dashboard-card-title">
            {{ translationService.t('dashboard.needsAttention') }}
          </h3>
          <p class="dashboard-card-hint">
            {{ translationService.t('dashboard.needsAttentionHint') }}
          </p>
        </div>
      </div>

      @if (loading) {
        <div class="animate-pulse space-y-2.5">
          @for (i of [1, 2, 3, 4]; track i) {
            <div class="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3 dark:bg-[color:var(--color-surface-container-high)]">
              <div class="h-9 w-9 shrink-0 rounded-lg bg-slate-200 dark:bg-[color:var(--color-surface-container)]"></div>
              <div class="h-3.5 flex-1 rounded bg-slate-200 dark:bg-[color:var(--color-surface-container)]"></div>
              <div class="h-6 w-8 rounded-full bg-slate-200 dark:bg-[color:var(--color-surface-container)]"></div>
            </div>
          }
        </div>
      } @else {
        <ul class="flex-1 space-y-2.5">
          @for (item of items; track item.labelKey) {
            <li>
              <a
                [routerLink]="item.route"
                [queryParams]="item.queryParams"
                class="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
                [ngClass]="
                  item.count > 0
                    ? 'bg-amber-50/80 hover:bg-amber-100/70 dark:bg-amber-500/10 dark:hover:bg-amber-500/15'
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-[color:var(--color-surface-container-high)] dark:hover:bg-[color:var(--color-surface-container-highest)]'
                "
              >
                <span
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg [&>svg]:h-4.5 [&>svg]:w-4.5"
                  [ngClass]="item.iconBgClass"
                  [innerHTML]="item.icon | safeHtml"
                ></span>
                <span class="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700 dark:text-[color:var(--color-on-surface)]">
                  {{ translationService.t(item.labelKey) }}
                </span>
                @if (item.count > 0) {
                  <span
                    class="ayar-num inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-extrabold text-white"
                  >
                    {{ item.count }}
                  </span>
                } @else {
                  <span
                    class="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                    [innerHTML]="checkIcon | safeHtml"
                  ></span>
                }
                <svg
                  class="attention-chevron shrink-0 text-slate-300 transition-colors group-hover:text-gold-500 dark:text-[color:var(--color-on-surface-variant)]"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </a>
            </li>
          }
        </ul>
      }

      <!-- Bottom action -->
      <a routerLink="/admin-inbox" class="ayar-btn ayar-btn-outline mt-5 w-full">
        <span class="inline-flex h-4 w-4" [innerHTML]="inboxIcon | safeHtml"></span>
        {{ translationService.t('dashboard.adminInboxButton') }}
      </a>
    </div>
  `,
})
export class AttentionListComponent {
  @Input() items: AttentionItem[] = [];
  @Input() loading = false;

  readonly checkIcon =
    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
  readonly inboxIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z"/></svg>';

  constructor(public translationService: TranslationService) {}

  get totalCount(): number {
    return this.items.reduce((sum, item) => sum + (item.count || 0), 0);
  }
}
