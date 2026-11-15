import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../services/translation.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

export interface AttentionItem {
  labelKey: string;
  count: number;
  route: string;
  queryParams?: Record<string, string>;
  /** Material Symbols ligature name. */
  icon: string;
}

/** M3 task list: queues that need the admin's attention, with counts. */
@Component({
  selector: 'app-attention-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule, MatIconModule, MatListModule],
  template: `
    <mat-card appearance="outlined" class="h-full">
      <mat-card-header>
        <div
          mat-card-avatar
          class="app-tone-primary ayar-num flex items-center justify-center text-m3-title-md font-medium"
        >
          {{ totalCount }}
        </div>
        <mat-card-title class="text-m3-title-lg font-medium">
          {{ translationService.t('dashboard.needsAttention') }}
        </mat-card-title>
        <mat-card-subtitle>
          {{ translationService.t('dashboard.needsAttentionHint') }}
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content class="flex-1">
        @if (loading) {
          <div class="animate-pulse space-y-2.5 py-2">
            @for (i of [1, 2, 3, 4]; track i) {
              <div class="flex items-center gap-3 px-3 py-3">
                <div class="app-skeleton h-10 w-10 shrink-0" style="border-radius: 9999px"></div>
                <div class="app-skeleton h-3.5 flex-1"></div>
                <div class="app-skeleton h-6 w-8" style="border-radius: 9999px"></div>
              </div>
            }
          </div>
        } @else {
          <mat-nav-list>
            @for (item of items; track item.labelKey) {
              <a mat-list-item [routerLink]="item.route" [queryParams]="item.queryParams">
                <mat-icon
                  matListItemIcon
                  [ngClass]="
                    item.count > 0
                      ? 'text-(--mat-sys-primary)'
                      : 'text-(--mat-sys-on-surface-variant)'
                  "
                  >{{ item.icon }}</mat-icon
                >
                <span matListItemTitle>{{ translationService.t(item.labelKey) }}</span>
                @if (item.count > 0) {
                  <span
                    matListItemMeta
                    class="ayar-num inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-(--mat-sys-primary) px-1.5 text-m3-label-md font-medium text-(--mat-sys-on-primary)"
                  >
                    {{ item.count }}
                  </span>
                } @else {
                  <mat-icon matListItemMeta class="text-success-500">check_circle</mat-icon>
                }
              </a>
            }
          </mat-nav-list>
        }
      </mat-card-content>

      <mat-card-actions>
        <a matButton="outlined" routerLink="/admin-inbox" class="w-full">
          <mat-icon>inbox</mat-icon>
          {{ translationService.t('dashboard.adminInboxButton') }}
        </a>
      </mat-card-actions>
    </mat-card>
  `,
})
export class AttentionListComponent {
  @Input() items: AttentionItem[] = [];
  @Input() loading = false;

  constructor(public translationService: TranslationService) {}

  get totalCount(): number {
    return this.items.reduce((sum, item) => sum + (item.count || 0), 0);
  }
}
