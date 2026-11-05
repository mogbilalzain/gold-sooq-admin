import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule, MatChipSelectionChange } from '@angular/material/chips';
import { PageHeaderComponent } from '../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../shared/components/common/loading-spinner/loading-spinner.component';
import { InboxItemIconComponent } from '../../shared/components/header/notification-dropdown/inbox-item-icon.component';
import { TranslationService } from '../../shared/services/translation.service';
import { ErrorHandlerService } from '../../shared/services/api/error-handler.service';
import {
  ADMIN_INBOX_TYPES,
  AdminInboxItem,
  AdminInboxService,
  AdminInboxType,
  INBOX_PAGE_SIZE,
} from '../../shared/services/data/admin-inbox.service';

/** Full, filterable history of the admin bell notifications. */
@Component({
  selector: 'app-admin-inbox',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatChipsModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    InboxItemIconComponent,
  ],
  template: `
    <app-page-header
      [title]="translationService.t('adminInbox.title')"
      [subtitle]="translationService.t('adminInbox.pageSubtitle')">
    </app-page-header>

    @if (errorMessage()) {
      <div class="mb-4 p-3 text-sm rounded-xl status-pill-error">{{ errorMessage() }}</div>
    }

    <div class="modern-card !p-5 md:!p-6 mb-6 flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-3">
        <mat-chip-listbox hideSingleSelectionIndicator [attr.aria-label]="translationService.t('adminInbox.allTypes')">
          <mat-chip-option [selected]="type() === null" (selectionChange)="pickType($event, null)">
            {{ translationService.t('adminInbox.allTypes') }}
          </mat-chip-option>
          @for (option of types; track option) {
            <mat-chip-option [selected]="type() === option" (selectionChange)="pickType($event, option)">
              {{ inbox.typeLabel(option) }}
            </mat-chip-option>
          }
        </mat-chip-listbox>

        <mat-chip-listbox [attr.aria-label]="translationService.t('adminInbox.unreadOnly')">
          <mat-chip-option [selected]="unreadOnly()" (selectionChange)="toggleUnreadOnly($event)">
            {{ translationService.t('adminInbox.unreadOnly') }}
          </mat-chip-option>
        </mat-chip-listbox>
      </div>

      @if (inbox.unreadCount() > 0) {
        <button matButton="outlined" (click)="markAllRead()">
          {{ translationService.t('adminInbox.markAllRead') }}
        </button>
      }
    </div>

    <div class="modern-card !p-3 md:!p-4">
      @if (loading() && !items().length) {
        <app-loading-spinner />
      } @else if (!items().length) {
        <p class="py-10 text-center text-m3-body-md text-[color:var(--color-on-surface-variant)]">
          {{ translationService.t(isFiltered ? 'adminInbox.emptyFiltered' : 'adminInbox.empty') }}
        </p>
      } @else {
        <ul class="app-inbox-list app-inbox-list-page">
          @for (item of items(); track item.id) {
            <li>
              <button
                type="button"
                class="app-inbox-item"
                [class.app-inbox-item-unread]="!item.is_read"
                (click)="open(item)"
              >
                <app-inbox-item-icon [type]="item.type" />
                <span class="app-inbox-text">
                  <span class="app-inbox-title text-m3-label-lg">{{ inbox.titleOf(item) }}</span>
                  <span class="app-inbox-message text-m3-label-sm">{{ inbox.messageOf(item) }}</span>
                  <span class="app-inbox-meta text-m3-label-sm">
                    {{ inbox.typeLabel(item.type) }} · {{ inbox.timeAgo(item.created_at) }}
                    · {{ item.created_at | date: 'medium' }}
                  </span>
                </span>
                @if (!item.is_read) {
                  <span class="app-inbox-dot" aria-hidden="true"></span>
                }
              </button>
            </li>
          }
        </ul>
        @if (hasMore()) {
          <button
            type="button"
            class="app-inbox-more text-m3-label-lg mt-2"
            [disabled]="loading()"
            (click)="loadMore()"
          >
            {{ translationService.t('adminInbox.loadMore') }}
          </button>
        }
      }
    </div>
  `,
})
export class AdminInboxComponent implements OnInit {
  readonly inbox = inject(AdminInboxService);
  readonly translationService = inject(TranslationService);
  private errorHandler = inject(ErrorHandlerService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly types = ADMIN_INBOX_TYPES;

  readonly items = signal<AdminInboxItem[]>([]);
  readonly loading = signal(false);
  readonly hasMore = signal(false);
  readonly errorMessage = signal('');
  readonly type = signal<AdminInboxType | null>(null);
  readonly unreadOnly = signal(false);

  ngOnInit(): void {
    this.reload();

    this.inbox.received$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((item) => {
        if (this.matchesFilters(item) && !this.items().some((i) => i.id === item.id)) {
          this.items.update((list) => [item, ...list]);
        }
      });
  }

  get isFiltered(): boolean {
    return this.type() !== null || this.unreadOnly();
  }

  pickType(event: MatChipSelectionChange, type: AdminInboxType | null): void {
    if (!event.selected) {
      event.source.select();
      return;
    }
    if (this.type() !== type) {
      this.type.set(type);
      this.reload();
    }
  }

  toggleUnreadOnly(event: MatChipSelectionChange): void {
    this.unreadOnly.set(event.selected);
    this.reload();
  }

  loadMore(): void {
    const current = this.items();
    if (!current.length || this.loading()) {
      return;
    }
    this.fetch(current[current.length - 1].id);
  }

  open(item: AdminInboxItem): void {
    if (!item.is_read) {
      this.inbox.markRead(item).subscribe(() => this.setRead((i) => i.id === item.id));
    }
    this.router.navigate(this.inbox.routeFor(item));
  }

  markAllRead(): void {
    this.inbox.markAllRead().subscribe({
      next: () => this.setRead(() => true),
      error: (err) => this.errorMessage.set(this.errorHandler.handleError(err).message),
    });
  }

  private reload(): void {
    this.items.set([]);
    this.hasMore.set(false);
    this.fetch();
  }

  private fetch(beforeId?: number): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.inbox
      .query({ type: this.type(), unreadOnly: this.unreadOnly(), beforeId })
      .subscribe({
        next: (data) => {
          this.items.update((list) => (beforeId ? [...list, ...data.items] : data.items));
          this.hasMore.set(data.items.length === INBOX_PAGE_SIZE);
          this.loading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(this.errorHandler.handleError(err).message);
          this.loading.set(false);
        },
      });
  }

  private matchesFilters(item: AdminInboxItem): boolean {
    const type = this.type();
    return (type === null || item.type === type) && (!this.unreadOnly() || !item.is_read);
  }

  private setRead(predicate: (item: AdminInboxItem) => boolean): void {
    this.items.update((list) => list.map((i) => (predicate(i) ? { ...i, is_read: 1 } : i)));
  }
}
