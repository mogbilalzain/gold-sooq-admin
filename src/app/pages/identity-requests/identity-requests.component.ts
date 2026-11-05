import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../shared/components/common/loading-spinner/loading-spinner.component';
import { PaginationComponent } from '../../shared/components/common/pagination/pagination.component';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule, MatChipSelectionChange } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslationService } from '../../shared/services/translation.service';
import {
  IdentityService,
  IdentityRequestStatus,
  IdentityRequestSummary,
} from '../../shared/services/data/identity.service';
import { ErrorHandlerService } from '../../shared/services/api/error-handler.service';

type StatusFilter = IdentityRequestStatus | 'all';

/** Identity (KYC) verification requests — server-side paginated. */
@Component({
  selector: 'app-identity-requests',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    PaginationComponent,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <app-page-header
      [title]="translationService.t('identity.list.title')"
      [subtitle]="translationService.t('identity.list.subtitle')">
    </app-page-header>

    @if (errorMessage) {
      <div class="mb-4 p-3 text-sm rounded-xl status-pill-error">{{ errorMessage }}</div>
    }

    <div class="modern-card !p-5 md:!p-6 mb-6">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <mat-chip-listbox hideSingleSelectionIndicator [attr.aria-label]="translationService.t('identity.list.status')">
          @for (option of statusOptions; track option) {
            <mat-chip-option
              [selected]="statusFilter === option"
              (selectionChange)="pickStatus($event, option)">
              {{ translationService.t('identity.status.' + option) }}
            </mat-chip-option>
          }
        </mat-chip-listbox>
        <div class="flex items-center gap-2">
          <mat-form-field class="w-full md:w-44" subscriptSizing="dynamic">
            <mat-label>{{ translationService.t('identity.list.userIdPlaceholder') }}</mat-label>
            <input
              matInput
              type="number"
              [(ngModel)]="userIdFilter"
              (keyup.enter)="onUserIdApply()"
              min="1"
            />
          </mat-form-field>
          <button matButton="outlined" (click)="onUserIdApply()">{{ translationService.t('common.search') }}</button>
        </div>
      </div>
    </div>

    @if (isLoading) {
      <app-loading-spinner />
    } @else {
      <div class="modern-table">
        <div class="overflow-x-auto">
          <table mat-table [dataSource]="requests" class="w-full" [ngClass]="{'text-right': translationService.isRTL, 'text-left': !translationService.isRTL}">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>#</th>
              <td mat-cell *matCellDef="let request" class="text-sm">{{ request.id }}</td>
            </ng-container>

            <ng-container matColumnDef="user">
              <th mat-header-cell *matHeaderCellDef>{{ translationService.t('identity.list.user') }}</th>
              <td mat-cell *matCellDef="let request" class="text-sm font-medium">
                <div>{{ request.full_name || ('#' + request.user_id) }}</div>
                <div class="text-xs text-[color:var(--color-on-surface-variant)]">ID: {{ request.user_id }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="idNumber">
              <th mat-header-cell *matHeaderCellDef>{{ translationService.t('identity.list.idNumber') }}</th>
              <td mat-cell *matCellDef="let request" class="text-sm" dir="ltr">{{ request.id_number_last4 ? ('•••• ' + request.id_number_last4) : '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>{{ translationService.t('identity.list.status') }}</th>
              <td mat-cell *matCellDef="let request">
                <span class="status-pill" [ngClass]="statusPillClass(request.status)">
                  {{ translationService.t('identity.status.' + request.status) }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="submittedAt">
              <th mat-header-cell *matHeaderCellDef>{{ translationService.t('identity.list.submittedAt') }}</th>
              <td mat-cell *matCellDef="let request" class="text-sm">{{ (request.submitted_at || request.created_at) | date:'yyyy-MM-dd' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>{{ translationService.t('common.actions') }}</th>
              <td mat-cell *matCellDef="let request">
                <button
                  mat-icon-button
                  [routerLink]="['/identity-requests', request.id]"
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
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell px-6 py-12 text-center text-[color:var(--color-on-surface-variant)]" [attr.colspan]="displayedColumns.length">
                {{ translationService.t('identity.list.empty') }}
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
export class IdentityRequestsComponent implements OnInit {
  requests: IdentityRequestSummary[] = [];
  displayedColumns = ['id', 'user', 'idNumber', 'status', 'submittedAt', 'actions'];
  isLoading = false;
  errorMessage = '';

  currentPage = 1;
  limit = 20;
  total = 0;
  totalPages = 0;

  statusFilter: StatusFilter = 'pending';
  readonly statusOptions: StatusFilter[] = ['pending', 'more_info_required', 'approved', 'rejected', 'all'];
  userIdFilter: number | null = null;
  appliedUserId: number | undefined = undefined;

  constructor(
    public translationService: TranslationService,
    private identityService: IdentityService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.identityService.list({
      page: this.currentPage,
      limit: this.limit,
      status: this.statusFilter,
      userId: this.appliedUserId,
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 'success' && response.data) {
          this.requests = response.data.requests || [];
          this.total = response.data.pagination?.total ?? this.requests.length;
          this.totalPages = response.data.pagination?.totalPages ?? 1;
        } else {
          this.errorMessage = response.message || this.translationService.t('identity.list.loadFailed');
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

  onUserIdApply(): void {
    const value = Number(this.userIdFilter);
    this.appliedUserId = Number.isFinite(value) && value > 0 ? value : undefined;
    this.currentPage = 1;
    this.load();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.load();
  }

  statusPillClass(status: IdentityRequestStatus): string {
    switch (status) {
      case 'approved': return 'status-pill-success';
      case 'pending': return 'status-pill-warning';
      case 'more_info_required': return 'status-pill-info';
      case 'rejected': return 'status-pill-error';
      default: return '';
    }
  }
}
