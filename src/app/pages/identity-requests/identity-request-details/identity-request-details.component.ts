import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { PageHeaderComponent } from '../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/common/loading-spinner/loading-spinner.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import {
  SecureDocumentViewerComponent,
  SecureDocument,
} from '../../../shared/components/common/secure-document-viewer/secure-document-viewer.component';
import { ConfirmDialogComponent } from '../../../shared/components/common/confirm-dialog/confirm-dialog.component';
import { TranslationService } from '../../../shared/services/translation.service';
import {
  IdentityService,
  IdentityRequestDetails,
  IdentityRequestEvent,
  IdentityDetailsData,
  IdentityReasonCode,
  IdentityMissingItem,
  IDENTITY_REASON_CODES,
  IDENTITY_MISSING_ITEMS,
} from '../../../shared/services/data/identity.service';
import { ErrorHandlerService } from '../../../shared/services/api/error-handler.service';
import { isFutureDubaiDate, isValidEmiratesId, normalizeDigits } from '../../../shared/utils/dubai-date';

type ActionPanel = 'none' | 'approve' | 'moreInfo' | 'reject';

/** Identity (KYC) request details with document review and moderation actions. */
@Component({
  selector: 'app-identity-request-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    ButtonComponent,
    SecureDocumentViewerComponent,
    ConfirmDialogComponent,
    MatDialogModule,
  ],
  template: `
    <app-page-header
      [title]="translationService.t('identity.details.title') + ' #' + requestId"
      [subtitle]="translationService.t('identity.details.subtitle')">
    </app-page-header>

    <div class="mb-4">
      <a routerLink="/identity-requests"
         class="font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300 transition-colors">
        → {{ translationService.t('identity.details.backToList') }}
      </a>
    </div>

    @if (errorMessage) {
      <div class="mb-4 p-3 text-sm rounded-xl status-pill-error">{{ errorMessage }}</div>
    }
    @if (successMessage) {
      <div class="mb-4 p-3 text-sm rounded-xl status-pill-success">{{ successMessage }}</div>
    }

    @if (isLoading) {
      <app-loading-spinner />
    } @else if (request) {
      @if (possibleDuplicate) {
        <div class="mb-4 rounded-xl border border-error-300 bg-error-50 px-4 py-3 text-sm font-medium text-error-700 dark:border-error-700 dark:bg-error-500/10 dark:text-error-300">
          {{ translationService.t('identity.details.possibleDuplicate') }}
        </div>
      }

      <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <!-- Documents -->
        <div class="space-y-4 xl:col-span-2">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <app-secure-document-viewer
              [label]="translationService.t('identity.details.docFront')"
              [doc]="docFront"
              (refreshRequested)="reload()" />
            <app-secure-document-viewer
              [label]="translationService.t('identity.details.docBack')"
              [doc]="docBack"
              (refreshRequested)="reload()" />
            <app-secure-document-viewer
              [label]="translationService.t('identity.details.docSelfie')"
              [doc]="docSelfie"
              (refreshRequested)="reload()" />
          </div>

          <!-- Audit trail -->
          @if (events.length) {
            <div class="modern-card !p-5">
              <h3 class="mb-3 text-m3-title-sm font-semibold text-[color:var(--color-on-surface)]">{{ translationService.t('identity.details.events') }}</h3>
              <ul class="space-y-3">
                @for (event of events; track $index) {
                  <li class="border-s-2 border-outline-variant/60 ps-3">
                    <p class="text-sm font-medium">{{ translationService.t('identity.event.' + (event.event || event.type)) !== ('identity.event.' + (event.event || event.type)) ? translationService.t('identity.event.' + (event.event || event.type)) : (event.event || event.type) }}</p>
                    <p class="text-xs text-[color:var(--color-on-surface-variant)]">{{ event.created_at | date:'yyyy-MM-dd HH:mm' }}</p>
                    @if (event.reason_code) {
                      <p class="text-xs">{{ translationService.t('identity.reason.' + event.reason_code) }}</p>
                    }
                  </li>
                }
              </ul>
            </div>
          }
        </div>

        <!-- Info + actions -->
        <div class="space-y-4">
          <div class="modern-card !p-5">
            <h3 class="mb-3 text-m3-title-sm font-semibold text-[color:var(--color-on-surface)]">{{ translationService.t('identity.details.requestInfo') }}</h3>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between gap-3">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('identity.list.user') }}</dt>
                <dd class="font-medium">
                  <a [routerLink]="['/users', request.user_id]" class="text-brand-700 dark:text-brand-400">
                    {{ request.full_name || ('#' + request.user_id) }}
                  </a>
                </dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('identity.list.status') }}</dt>
                <dd><span class="status-pill" [ngClass]="statusPillClass()">{{ translationService.t('identity.status.' + request.status) }}</span></dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('identity.list.idNumber') }}</dt>
                <dd class="font-medium" dir="ltr">{{ request.id_number_last4 ? ('•••• ' + request.id_number_last4) : '-' }}</dd>
              </div>
              @if (request.full_name_on_id) {
                <div class="flex justify-between gap-3">
                  <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('identity.details.fullNameOnId') }}</dt>
                  <dd class="font-medium">{{ request.full_name_on_id }}</dd>
                </div>
              }
              @if (request.id_expiry_date) {
                <div class="flex justify-between gap-3">
                  <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('identity.details.idExpiry') }}</dt>
                  <dd class="font-medium" dir="ltr">{{ request.id_expiry_date | date:'yyyy-MM-dd' }}</dd>
                </div>
              }
              <div class="flex justify-between gap-3">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('identity.list.submittedAt') }}</dt>
                <dd class="font-medium">{{ (request.submitted_at || request.created_at) | date:'yyyy-MM-dd HH:mm' }}</dd>
              </div>
            </dl>
          </div>

          <!-- Moderation actions (pending only) -->
          @if (request.status === 'pending') {
            <div class="modern-card !p-5">
              <h3 class="mb-3 text-m3-title-sm font-semibold text-[color:var(--color-on-surface)]">{{ translationService.t('identity.details.actions') }}</h3>
              <div class="flex flex-col gap-2">
                <app-button variant="primary" size="sm" (btnClick)="openPanel('approve')">
                  {{ translationService.t('identity.details.approve') }}
                </app-button>
                <app-button variant="outline" size="sm" (btnClick)="openPanel('moreInfo')">
                  {{ translationService.t('identity.details.requestMoreInfo') }}
                </app-button>
                <app-button variant="danger" size="sm" (btnClick)="openPanel('reject')">
                  {{ translationService.t('identity.details.reject') }}
                </app-button>
              </div>
            </div>
          }

          <!-- Revoke (approved request → verified identity) -->
          @if (request.status === 'approved') {
            <div class="modern-card !p-5">
              <h3 class="mb-2 text-m3-title-sm font-semibold text-[color:var(--color-on-surface)]">{{ translationService.t('identity.details.revoke') }}</h3>
              <p class="mb-3 text-xs text-[color:var(--color-on-surface-variant)]">
                {{ translationService.t('identity.details.revokeWarning') }}
              </p>
              <app-button variant="danger" size="sm" (btnClick)="revokeConfirmOpen = true">
                {{ translationService.t('identity.details.revoke') }}
              </app-button>
            </div>
          }
        </div>
      </div>

      <!-- Action panels (MatDialog; content keeps this component as its context) -->
      <ng-template #actionPanelDialog>
        <div class="w-full max-w-lg">
            <!-- Approve -->
            @if (activePanel === 'approve') {
              <h3 class="mb-1 text-m3-title-md font-semibold text-[color:var(--color-on-surface)]">{{ translationService.t('identity.details.approveTitle') }}</h3>
              <p class="mb-4 text-xs text-[color:var(--color-on-surface-variant)]">{{ translationService.t('identity.details.approveHint') }}</p>
              <div class="space-y-3">
                <div>
                  <label class="mb-1 block text-sm font-medium">{{ translationService.t('identity.details.idNumberFromDocument') }} *</label>
                  <input type="text" [(ngModel)]="approveIdNumber" dir="ltr" class="form-input w-full text-sm"
                         [placeholder]="translationService.t('identity.details.idNumberPlaceholder')" />
                  @if (approveIdNumber && !idNumberValid()) {
                    <p class="mt-1 text-xs text-error-500">{{ translationService.t('identity.details.idNumberInvalid') }}</p>
                  }
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium">{{ translationService.t('identity.details.idExpiryFromDocument') }} *</label>
                  <input type="date" [(ngModel)]="approveIdExpiry" dir="ltr" class="form-input w-full text-sm" />
                  @if (approveIdExpiry && !isFutureDubaiDate(approveIdExpiry)) {
                    <p class="mt-1 text-xs text-error-500">{{ translationService.t('identity.details.idExpiryInvalid') }}</p>
                  }
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium">{{ translationService.t('identity.details.internalNote') }}</label>
                  <textarea [(ngModel)]="approveInternalNote" rows="2" class="form-input w-full text-sm"></textarea>
                </div>
                <div class="flex justify-end gap-2 pt-2">
                  <app-button variant="outline" size="sm" (btnClick)="closePanel()">{{ translationService.t('common.cancel') }}</app-button>
                  <app-button variant="primary" size="sm" [disabled]="!canApprove() || actionProcessing" (btnClick)="submitApprove()">
                    {{ actionProcessing ? translationService.t('common.saving') : translationService.t('identity.details.approve') }}
                  </app-button>
                </div>
              </div>
            }

            <!-- More info / Reject -->
            @if (activePanel === 'moreInfo' || activePanel === 'reject') {
              <h3 class="mb-1 text-m3-title-md font-semibold text-[color:var(--color-on-surface)]">
                {{ translationService.t(activePanel === 'moreInfo' ? 'identity.details.moreInfoTitle' : 'identity.details.rejectTitle') }}
              </h3>
              <p class="mb-4 text-xs text-[color:var(--color-on-surface-variant)]">
                {{ translationService.t(activePanel === 'moreInfo' ? 'identity.details.moreInfoHint' : 'identity.details.rejectHint') }}
              </p>
              <div class="space-y-3">
                <div>
                  <label class="mb-1 block text-sm font-medium">{{ translationService.t('identity.details.reasonCode') }} *</label>
                  <select [(ngModel)]="reasonCode" class="form-input w-full text-sm">
                    <option value="">{{ translationService.t('identity.details.selectReason') }}</option>
                    @for (code of reasonCodes; track code) {
                      <option [value]="code">{{ translationService.t('identity.reason.' + code) }}</option>
                    }
                  </select>
                </div>
                @if (activePanel === 'moreInfo') {
                  <div>
                    <label class="mb-1 block text-sm font-medium">{{ translationService.t('identity.details.missingItems') }}</label>
                    <div class="flex flex-wrap gap-3">
                      @for (item of missingItemOptions; track item) {
                        <label class="flex items-center gap-1.5 text-sm">
                          <input type="checkbox" [checked]="missingItems.has(item)" (change)="toggleMissingItem(item)" />
                          {{ translationService.t('identity.missing.' + item) }}
                        </label>
                      }
                    </div>
                  </div>
                }
                <div>
                  <label class="mb-1 block text-sm font-medium">{{ translationService.t('identity.details.userMessage') }}</label>
                  <textarea [(ngModel)]="userMessage" rows="3" class="form-input w-full text-sm"
                            [placeholder]="translationService.t('identity.details.userMessagePlaceholder')"></textarea>
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium">{{ translationService.t('identity.details.internalNote') }}</label>
                  <textarea [(ngModel)]="internalNote" rows="2" class="form-input w-full text-sm"></textarea>
                </div>
                <div class="flex justify-end gap-2 pt-2">
                  <app-button variant="outline" size="sm" (btnClick)="closePanel()">{{ translationService.t('common.cancel') }}</app-button>
                  <app-button [variant]="activePanel === 'reject' ? 'danger' : 'primary'" size="sm"
                              [disabled]="!reasonCode || actionProcessing"
                              (btnClick)="activePanel === 'moreInfo' ? submitMoreInfo() : submitReject()">
                    {{ actionProcessing ? translationService.t('common.saving') : translationService.t(activePanel === 'moreInfo' ? 'identity.details.requestMoreInfo' : 'identity.details.reject') }}
                  </app-button>
                </div>
              </div>
            }
        </div>
      </ng-template>

      <!-- Revoke confirm -->
      <app-confirm-dialog
        [open]="revokeConfirmOpen"
        variant="destructive"
        [title]="translationService.t('identity.details.revokeConfirmTitle')"
        [message]="translationService.t('identity.details.revokeConfirmMessage')"
        [confirmLabel]="translationService.t('identity.details.revoke')"
        [cancelLabel]="translationService.t('common.cancel')"
        [processing]="actionProcessing"
        (confirmed)="submitRevoke()"
        (cancelled)="revokeConfirmOpen = false" />
    }
  `,
})
export class IdentityRequestDetailsComponent implements OnInit, OnDestroy {
  request: IdentityRequestDetails | null = null;
  possibleDuplicate = false;
  events: IdentityRequestEvent[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  requestId = 0;

  docFront: SecureDocument | null = null;
  docBack: SecureDocument | null = null;
  docSelfie: SecureDocument | null = null;

  activePanel: ActionPanel = 'none';
  actionProcessing = false;
  revokeConfirmOpen = false;

  @ViewChild('actionPanelDialog') actionPanelDialog!: TemplateRef<unknown>;
  private panelRef: MatDialogRef<unknown> | null = null;

  // Approve form
  approveIdNumber = '';
  approveIdExpiry = '';
  approveInternalNote = '';

  // More-info / reject form
  reasonCode: IdentityReasonCode | '' = '';
  userMessage = '';
  internalNote = '';
  missingItems = new Set<IdentityMissingItem>();

  readonly reasonCodes = IDENTITY_REASON_CODES;
  readonly missingItemOptions = IDENTITY_MISSING_ITEMS;
  readonly isFutureDubaiDate = isFutureDubaiDate;

  private destroy$ = new Subject<void>();

  constructor(
    public translationService: TranslationService,
    private route: ActivatedRoute,
    private identityService: IdentityService,
    private errorHandler: ErrorHandlerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          this.requestId = Number(params.get('id')) || 0;
          this.isLoading = true;
          this.errorMessage = '';
          this.successMessage = '';
          return this.identityService.getById(this.requestId);
        })
      )
      .subscribe({
        next: (response) => this.applyResponse(response),
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = this.errorHandler.handleError(error).message;
        },
      });
  }

  ngOnDestroy(): void {
    this.panelRef?.close();
    this.destroy$.next();
    this.destroy$.complete();
  }

  reload(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.identityService.getById(this.requestId).subscribe({
      next: (response) => this.applyResponse(response),
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.errorHandler.handleError(error).message;
      },
    });
  }

  private applyResponse(response: { status: string; message?: string; data?: IdentityDetailsData }): void {
    this.isLoading = false;
    if (response.status === 'success' && response.data) {
      this.request = response.data.request;
      // viewUrls / events / possibleDuplicate are siblings of `request` in `data`.
      this.possibleDuplicate = !!response.data.possibleDuplicate;
      this.events = response.data.events || [];
      const urls = response.data.viewUrls;
      this.docFront = this.toSecureDoc(urls?.front);
      this.docBack = this.toSecureDoc(urls?.back);
      this.docSelfie = this.toSecureDoc(urls?.selfie);
    } else {
      this.errorMessage = response.message || this.translationService.t('identity.details.loadFailed');
    }
  }

  private toSecureDoc(value: { url: string; expiresAt?: string } | string | null | undefined): SecureDocument | null {
    if (!value) return null;
    if (typeof value === 'string') return { url: value };
    return value.url ? { url: value.url, expiresAt: value.expiresAt } : null;
  }

  statusPillClass(): string {
    switch (this.request?.status) {
      case 'approved': return 'status-pill-success';
      case 'pending': return 'status-pill-warning';
      case 'more_info_required': return 'status-pill-info';
      case 'rejected': return 'status-pill-error';
      default: return '';
    }
  }

  openPanel(panel: ActionPanel): void {
    this.activePanel = panel;
    this.reasonCode = '';
    this.userMessage = '';
    this.internalNote = '';
    this.missingItems.clear();
    // Template-ref dialog: the ng-template keeps this component as its context.
    this.panelRef = this.dialog.open(this.actionPanelDialog, {
      width: '512px',
      disableClose: true,
    });
    this.panelRef.afterClosed().subscribe(() => {
      this.panelRef = null;
      this.activePanel = 'none';
    });
  }

  closePanel(): void {
    if (this.actionProcessing) return;
    this.panelRef?.close();
  }

  toggleMissingItem(item: IdentityMissingItem): void {
    if (this.missingItems.has(item)) this.missingItems.delete(item);
    else this.missingItems.add(item);
  }

  idNumberValid(): boolean {
    return isValidEmiratesId(this.approveIdNumber);
  }

  canApprove(): boolean {
    return this.idNumberValid() && isFutureDubaiDate(this.approveIdExpiry);
  }

  submitApprove(): void {
    if (!this.canApprove() || this.actionProcessing) return;
    this.actionProcessing = true;
    this.identityService.approve({
      requestId: this.requestId,
      idNumberFromDocument: normalizeDigits(this.approveIdNumber),
      idExpiryDateFromDocument: this.approveIdExpiry,
      internalNote: this.approveInternalNote || undefined,
    }).subscribe({
      next: () => this.onActionSuccess('identity.details.approveSuccess'),
      error: (error) => this.onActionError(error),
    });
  }

  submitMoreInfo(): void {
    if (!this.reasonCode || this.actionProcessing) return;
    this.actionProcessing = true;
    this.identityService.requestMoreInfo({
      requestId: this.requestId,
      reasonCode: this.reasonCode as IdentityReasonCode,
      userMessage: this.userMessage || undefined,
      missingItems: this.missingItems.size ? [...this.missingItems] : undefined,
      internalNote: this.internalNote || undefined,
    }).subscribe({
      next: () => this.onActionSuccess('identity.details.moreInfoSuccess'),
      error: (error) => this.onActionError(error),
    });
  }

  submitReject(): void {
    if (!this.reasonCode || this.actionProcessing) return;
    this.actionProcessing = true;
    this.identityService.reject({
      requestId: this.requestId,
      reasonCode: this.reasonCode as IdentityReasonCode,
      userMessage: this.userMessage || undefined,
      internalNote: this.internalNote || undefined,
    }).subscribe({
      next: () => this.onActionSuccess('identity.details.rejectSuccess'),
      error: (error) => this.onActionError(error),
    });
  }

  submitRevoke(): void {
    if (!this.request || this.actionProcessing) return;
    this.actionProcessing = true;
    this.identityService.revoke({
      userId: this.request.user_id,
      reasonCode: 'policy_violation',
      internalNote: this.internalNote || undefined,
    }).subscribe({
      next: () => {
        this.revokeConfirmOpen = false;
        this.onActionSuccess('identity.details.revokeSuccess');
      },
      error: (error) => {
        this.revokeConfirmOpen = false;
        this.onActionError(error);
      },
    });
  }

  private onActionSuccess(messageKey: string): void {
    this.actionProcessing = false;
    // Closes the MatDialog panel; afterClosed resets activePanel to 'none'.
    this.panelRef?.close();
    this.activePanel = 'none';
    this.successMessage = this.translationService.t(messageKey);
    this.errorMessage = '';
    // Refetch — never trust local state after a mutation.
    this.reload();
  }

  private onActionError(error: HttpErrorResponse): void {
    this.actionProcessing = false;
    this.errorMessage = this.errorHandler.handleError(error).message;
    // After an uncertain error, refetch rather than retry.
    this.reload();
  }
}
