import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../shared/components/common/loading-spinner/loading-spinner.component';
import { PaginationComponent } from '../../shared/components/common/pagination/pagination.component';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule, MatChipSelectionChange } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { TranslationService } from '../../shared/services/translation.service';
import {
  ContactMessagesService,
  ContactMessage,
  ContactMessageStatus,
  CONTACT_MESSAGE_STATUSES,
} from '../../shared/services/data/contact-messages.service';
import { ErrorHandlerService } from '../../shared/services/api/error-handler.service';

type StatusFilter = ContactMessageStatus | 'all';

export function contactStatusPillClass(status: ContactMessageStatus): string {
  switch (status) {
    case 'new': return 'status-pill-warning';
    case 'in_progress': return 'status-pill-info';
    case 'resolved': return 'status-pill-success';
    case 'closed': return 'status-pill-error';
    default: return '';
  }
}

/** Website "contact us" inbox — server-side paginated. */
@Component({
  selector: 'app-contact-messages',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    PaginationComponent,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatButtonModule,
  ],
  template: `
    <app-page-header
      [title]="translationService.t('contactMessages.list.title')"
      [subtitle]="translationService.t('contactMessages.list.subtitle')">
    </app-page-header>

    @if (errorMessage) {
      <div class="mb-4 p-3 text-sm rounded-xl status-pill-error">{{ errorMessage }}</div>
    }

    <div class="modern-card !p-5 md:!p-6 mb-6">
      <mat-chip-listbox hideSingleSelectionIndicator [attr.aria-label]="translationService.t('contactMessages.list.status')">
        @for (option of statusOptions; track option) {
          <mat-chip-option
            [selected]="statusFilter === option"
            (selectionChange)="pickStatus($event, option)">
            {{ translationService.t('contactMessages.status.' + option) }}
          </mat-chip-option>
        }
      </mat-chip-listbox>
    </div>

    @if (isLoading) {
      <app-loading-spinner />
    } @else {
      <div class="modern-table">
        <div class="overflow-x-auto">
          <table mat-table [dataSource]="messages" class="w-full" [ngClass]="{'text-right': translationService.isRTL, 'text-left': !translationService.isRTL}">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>#</th>
              <td mat-cell *matCellDef="let message" class="text-sm">{{ message.id }}</td>
            </ng-container>

            <ng-container matColumnDef="sender">
              <th mat-header-cell *matHeaderCellDef>{{ translationService.t('contactMessages.list.sender') }}</th>
              <td mat-cell *matCellDef="let message" class="text-sm">
                <div class="font-medium">{{ message.full_name }}</div>
                <div class="text-xs font-normal text-[color:var(--color-on-surface-variant)]" dir="ltr">{{ message.email }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="inquiryType">
              <th mat-header-cell *matHeaderCellDef>{{ translationService.t('contactMessages.list.inquiryType') }}</th>
              <td mat-cell *matCellDef="let message" class="text-sm">{{ message.inquiry_type || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="subject">
              <th mat-header-cell *matHeaderCellDef>{{ translationService.t('contactMessages.list.subject') }}</th>
              <td mat-cell *matCellDef="let message" class="text-sm max-w-xs truncate" [title]="message.subject">{{ message.subject }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>{{ translationService.t('contactMessages.list.status') }}</th>
              <td mat-cell *matCellDef="let message">
                <span class="status-pill" [ngClass]="statusPillClass(message.status)">
                  {{ translationService.t('contactMessages.status.' + message.status) }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="receivedAt">
              <th mat-header-cell *matHeaderCellDef>{{ translationService.t('contactMessages.list.receivedAt') }}</th>
              <td mat-cell *matCellDef="let message" class="text-sm whitespace-nowrap" dir="ltr">{{ message.created_at | date:'yyyy-MM-dd HH:mm' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>{{ translationService.t('common.actions') }}</th>
              <td mat-cell *matCellDef="let message">
                <button
                  mat-icon-button
                  [routerLink]="['/contact-messages', message.id]"
                  [matTooltip]="translationService.t('common.details')"
                  [attr.aria-label]="translationService.t('common.details')"
                  class="!text-[color:var(--color-on-surface-variant)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                [ngClass]="row.status === 'new' ? 'font-semibold' : ''"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell px-6 py-12 text-center text-[color:var(--color-on-surface-variant)]" [attr.colspan]="displayedColumns.length">
                {{ translationService.t('contactMessages.list.empty') }}
              </td>
            </tr>
          </table>
        </div>

        @if (totalPages > 1) {
          <div class="border-t border-outline-variant/40 dark:border-outline-variant/30">
            <app-pagination
              [currentPage]="currentPage"
              [totalPages]="totalPages"
              [total]="total"
              [limit]="limit"
              (pageChange)="onPageChange($event)"
            />
          </div>
        }
      </div>
    }
  `,
})
export class ContactMessagesComponent implements OnInit {
  messages: ContactMessage[] = [];
  displayedColumns = ['id', 'sender', 'inquiryType', 'subject', 'status', 'receivedAt', 'actions'];
  isLoading = false;
  errorMessage = '';

  currentPage = 1;
  limit = 20;
  total = 0;
  totalPages = 0;

  statusFilter: StatusFilter = 'all';
  readonly statusOptions: StatusFilter[] = ['all', ...CONTACT_MESSAGE_STATUSES];

  readonly statusPillClass = contactStatusPillClass;

  constructor(
    public translationService: TranslationService,
    private contactMessagesService: ContactMessagesService,
    private errorHandler: ErrorHandlerService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const initial = this.route.snapshot.queryParamMap.get('status') as StatusFilter | null;
    if (initial && this.statusOptions.includes(initial)) {
      this.statusFilter = initial;
    }
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.contactMessagesService.list({
      page: this.currentPage,
      limit: this.limit,
      status: this.statusFilter === 'all' ? undefined : this.statusFilter,
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 'success' && response.data) {
          this.messages = response.data.messages || [];
          this.total = response.data.pagination?.totalCount ?? this.messages.length;
          this.totalPages = response.data.pagination?.totalPages ?? 1;
        } else {
          this.errorMessage = response.message || this.translationService.t('contactMessages.list.loadFailed');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.errorHandler.handleError(error).message;
      },
    });
  }

  onStatusChange(status: StatusFilter): void {
    this.statusFilter = status;
    this.currentPage = 1;
    this.load();
  }

  /** Single-select chip group: re-select the chip if the user clicks the active one. */
  pickStatus(event: MatChipSelectionChange, status: StatusFilter): void {
    if (event.selected) {
      this.onStatusChange(status);
    } else {
      event.source.select();
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.load();
  }
}
