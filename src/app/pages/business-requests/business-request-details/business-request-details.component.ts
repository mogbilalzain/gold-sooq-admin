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
  BusinessService,
  BusinessRequestDetails,
  BusinessRequestEvent,
  BusinessDetailsData,
  BusinessIdentitySummary,
  BusinessReasonCode,
  BusinessMissingItem,
  BusinessAuthority,
  BusinessKind,
  BusinessActivity,
  BUSINESS_REASON_CODES,
  BUSINESS_MISSING_ITEMS,
  BUSINESS_AUTHORITIES,
  BUSINESS_KINDS,
  BUSINESS_ACTIVITIES,
} from '../../../shared/services/data/business.service';
import { LookupService, StateEmirate } from '../../../shared/services/data/lookup.service';
import { ErrorHandlerService } from '../../../shared/services/api/error-handler.service';
import { isFutureDubaiDate } from '../../../shared/utils/dubai-date';

type ActionPanel = 'none' | 'approve' | 'moreInfo' | 'reject';
type LicenseCheckState = 'idle' | 'checking' | 'available' | 'claimed' | 'error';

/** Business verification request details: documents, license check, approve, more-info, reject, revoke. */
@Component({
  selector: 'app-business-request-details',
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
      [title]="translationService.t('business.details.title') + ' #' + requestId"
      [subtitle]="translationService.t('business.details.subtitle')">
    </app-page-header>

    <div class="mb-4">
      <a routerLink="/business-requests"
         class="font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300 transition-colors">
        → {{ translationService.t('business.details.backToList') }}
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
          {{ translationService.t('business.details.possibleDuplicate') }}
        </div>
      }

      <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <!-- Documents + events -->
        <div class="space-y-4 xl:col-span-2">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <app-secure-document-viewer
              [label]="translationService.t('business.details.docLicense')"
              [doc]="docLicense"
              (refreshRequested)="reload()" />
            <app-secure-document-viewer
              [label]="translationService.t('business.details.docAuthorization')"
              [doc]="docAuthorization"
              (refreshRequested)="reload()" />
          </div>

          @if (events.length) {
            <div class="modern-card !p-5">
              <h3 class="mb-3 text-m3-title-sm font-semibold text-[color:var(--color-on-surface)]">{{ translationService.t('business.details.events') }}</h3>
              <ul class="space-y-3">
                @for (event of events; track $index) {
                  <li class="border-s-2 border-outline-variant/60 ps-3">
                    <p class="text-sm font-medium">{{ event.event || event.type }}</p>
                    <p class="text-xs text-[color:var(--color-on-surface-variant)]">{{ event.created_at | date:'yyyy-MM-dd HH:mm' }}</p>
                    @if (event.reason_code) {
                      <p class="text-xs">{{ translationService.t('business.reason.' + event.reason_code) }}</p>
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
            <h3 class="mb-3 text-m3-title-sm font-semibold text-[color:var(--color-on-surface)]">{{ translationService.t('business.details.requestInfo') }}</h3>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between gap-3">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('business.list.user') }}</dt>
                <dd class="font-medium">
                  <a [routerLink]="['/users', request.user_id]" class="text-brand-700 dark:text-brand-400">
                    {{ request.full_name || ('#' + request.user_id) }}
                  </a>
                </dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('business.list.status') }}</dt>
                <dd><span class="status-pill" [ngClass]="statusPillClass()">{{ translationService.t('business.status.' + request.status) }}</span></dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('business.list.tradeName') }}</dt>
                <dd class="font-medium">{{ request.trade_name || '-' }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('business.details.legalName') }}</dt>
                <dd class="font-medium">{{ request.legal_name || '-' }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('business.list.authority') }}</dt>
                <dd class="font-medium">
                  {{ request.authority_code ? translationService.t('business.authority.' + request.authority_code) : '-' }}
                  @if (request.authority_code === 'OTHER_FREEZONE' && request.authority_name) {
                    <span>({{ request.authority_name }})</span>
                  }
                </dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('business.details.licenseNumber') }}</dt>
                <dd class="font-medium" dir="ltr">{{ request.license_number_raw || '-' }}</dd>
              </div>
              @if (request.license_expiry_date) {
                <div class="flex justify-between gap-3">
                  <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('business.details.licenseExpiry') }}</dt>
                  <dd class="font-medium" dir="ltr">{{ request.license_expiry_date | date:'yyyy-MM-dd' }}</dd>
                </div>
              }
              <div class="flex justify-between gap-3">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('business.list.submittedAt') }}</dt>
                <dd class="font-medium">{{ (request.submitted_at || request.created_at) | date:'yyyy-MM-dd HH:mm' }}</dd>
              </div>
              @if (identitySummary) {
                <div class="flex justify-between gap-3">
                  <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('business.details.identityStatus') }}</dt>
                  <dd class="font-medium">{{ identitySummary.identityStatus }}</dd>
                </div>
                @if (identitySummary.identityExpiresOn) {
                  <div class="flex justify-between gap-3">
                    <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('business.details.identityExpires') }}</dt>
                    <dd class="font-medium" dir="ltr">{{ identitySummary.identityExpiresOn | date:'yyyy-MM-dd' }}</dd>
                  </div>
                }
              }
            </dl>
          </div>

          <!-- Moderation actions (pending only) -->
          @if (request.status === 'pending') {
            <div class="modern-card !p-5">
              <h3 class="mb-3 text-m3-title-sm font-semibold text-[color:var(--color-on-surface)]">{{ translationService.t('business.details.actions') }}</h3>
              <div class="flex flex-col gap-2">
                <app-button variant="primary" size="sm" (btnClick)="openPanel('approve')">
                  {{ translationService.t('business.details.approve') }}
                </app-button>
                <app-button variant="outline" size="sm" (btnClick)="openPanel('moreInfo')">
                  {{ translationService.t('business.details.requestMoreInfo') }}
                </app-button>
                <app-button variant="danger" size="sm" (btnClick)="openPanel('reject')">
                  {{ translationService.t('business.details.reject') }}
                </app-button>
              </div>
            </div>
          }

          <!-- Revoke -->
          @if (request.status === 'approved') {
            <div class="modern-card !p-5">
              <h3 class="mb-2 text-m3-title-sm font-semibold text-[color:var(--color-on-surface)]">{{ translationService.t('business.details.revoke') }}</h3>
              <p class="mb-3 text-xs text-[color:var(--color-on-surface-variant)]">
                {{ translationService.t('business.details.revokeWarning') }}
              </p>
              <app-button variant="danger" size="sm" (btnClick)="revokeConfirmOpen = true">
                {{ translationService.t('business.details.revoke') }}
              </app-button>
            </div>
          }
        </div>
      </div>

      <!-- Action panels (MatDialog; content keeps this component as its context) -->
      <ng-template #actionPanelDialog>
        <div class="w-full max-w-2xl">
            <!-- Approve -->
            @if (activePanel === 'approve') {
              <h3 class="mb-1 text-m3-title-md font-semibold text-[color:var(--color-on-surface)]">{{ translationService.t('business.details.approveTitle') }}</h3>
              <p class="mb-4 text-xs text-[color:var(--color-on-surface-variant)]">{{ translationService.t('business.details.approveHint') }}</p>

              <!-- License availability check -->
              <div class="mb-4 rounded-xl border border-outline-variant/40 p-4">
                <h4 class="mb-2 text-sm font-bold">{{ translationService.t('business.details.licenseCheck') }}</h4>
                <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <select [(ngModel)]="checkAuthority" (ngModelChange)="resetLicenseCheck()" class="form-input w-full text-sm">
                    <option value="">{{ translationService.t('business.details.selectAuthority') }}</option>
                    @for (authority of authorities; track authority) {
                      <option [value]="authority">{{ translationService.t('business.authority.' + authority) }}</option>
                    }
                  </select>
                  <input type="text" [(ngModel)]="checkLicenseNumber" (ngModelChange)="resetLicenseCheck()" dir="ltr"
                         class="form-input w-full text-sm"
                         [placeholder]="translationService.t('business.details.licenseNumber')" />
                  <app-button variant="outline" size="sm"
                              [disabled]="!canCheckLicense() || licenseCheckState === 'checking'"
                              (btnClick)="runLicenseCheck()">
                    {{ licenseCheckState === 'checking' ? translationService.t('common.loading') : translationService.t('business.details.checkLicense') }}
                  </app-button>
                </div>
                @if (checkAuthority === 'OTHER_FREEZONE') {
                  <input type="text" [(ngModel)]="checkAuthorityName" (ngModelChange)="resetLicenseCheck()"
                         class="form-input mt-3 w-full text-sm"
                         [placeholder]="translationService.t('business.details.authorityNameRequired')" />
                }
                @if (licenseCheckState === 'available') {
                  <p class="mt-2 text-sm font-medium text-success-600 dark:text-success-400">{{ translationService.t('business.details.licenseAvailable') }}</p>
                }
                @if (licenseCheckState === 'claimed') {
                  <p class="mt-2 text-sm font-medium text-error-600 dark:text-error-400">
                    {{ translationService.t('business.details.licenseClaimed') }}
                    @if (licenseClaimedUserId) {
                      — <a [routerLink]="['/users', licenseClaimedUserId]" class="underline">{{ translationService.t('business.details.licenseClaimedUser') }} #{{ licenseClaimedUserId }}</a>
                    }
                  </p>
                }
                @if (licenseCheckState === 'error') {
                  <p class="mt-2 text-sm text-error-600 dark:text-error-400">{{ licenseCheckError }}</p>
                }
              </div>

              <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label class="mb-1 block text-sm font-medium">{{ translationService.t('business.details.legalNameFromDocument') }} *</label>
                  <input type="text" [(ngModel)]="approveLegalName" class="form-input w-full text-sm" />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium">{{ translationService.t('business.details.licenseNumberFromDocument') }} *</label>
                  <input type="text" [(ngModel)]="approveLicenseNumber" dir="ltr" class="form-input w-full text-sm" />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium">{{ translationService.t('business.details.authorityFromDocument') }} *</label>
                  <select [(ngModel)]="approveAuthority" class="form-input w-full text-sm">
                    <option value="">{{ translationService.t('business.details.selectAuthority') }}</option>
                    @for (authority of authorities; track authority) {
                      <option [value]="authority">{{ translationService.t('business.authority.' + authority) }}</option>
                    }
                  </select>
                </div>
                @if (approveAuthority === 'OTHER_FREEZONE') {
                  <div>
                    <label class="mb-1 block text-sm font-medium">{{ translationService.t('business.details.authorityNameFromDocument') }} *</label>
                    <input type="text" [(ngModel)]="approveAuthorityName" class="form-input w-full text-sm" />
                  </div>
                }
                <div>
                  <label class="mb-1 block text-sm font-medium">{{ translationService.t('business.details.licenseExpiryFromDocument') }} *</label>
                  <input type="date" [(ngModel)]="approveLicenseExpiry" dir="ltr" class="form-input w-full text-sm" />
                  @if (approveLicenseExpiry && !isFutureDubaiDate(approveLicenseExpiry)) {
                    <p class="mt-1 text-xs text-error-500">{{ translationService.t('business.details.licenseExpiryInvalid') }}</p>
                  }
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium">{{ translationService.t('business.details.tradeNameConfirmed') }} *</label>
                  <input type="text" [(ngModel)]="approveTradeName" class="form-input w-full text-sm" />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium">{{ translationService.t('business.details.businessKindConfirmed') }} *</label>
                  <select [(ngModel)]="approveBusinessKind" class="form-input w-full text-sm">
                    <option value="">{{ translationService.t('common.select') }}</option>
                    @for (kind of businessKinds; track kind) {
                      <option [value]="kind">{{ translationService.t('business.kind.' + kind) }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium">{{ translationService.t('business.details.activityTypeConfirmed') }} *</label>
                  <select [(ngModel)]="approveActivityType" class="form-input w-full text-sm">
                    <option value="">{{ translationService.t('common.select') }}</option>
                    @for (activity of businessActivities; track activity) {
                      <option [value]="activity">{{ translationService.t('business.activity.' + activity) }}</option>
                    }
                  </select>
                </div>
                <div class="md:col-span-2">
                  <label class="mb-1 block text-sm font-medium">{{ translationService.t('business.details.emirateConfirmed') }} *</label>
                  <select [(ngModel)]="approveEmirateStateId" class="form-input w-full text-sm">
                    <option [ngValue]="null">{{ translationService.t('common.select') }}</option>
                    @for (emirate of emirates; track emirate.id) {
                      <option [ngValue]="emirate.id">{{ lookupName(emirate) }}</option>
                    }
                  </select>
                </div>
                <div class="md:col-span-2">
                  <label class="mb-1 block text-sm font-medium">{{ translationService.t('business.details.internalNote') }}</label>
                  <textarea [(ngModel)]="approveInternalNote" rows="2" class="form-input w-full text-sm"></textarea>
                </div>
              </div>
              <div class="flex justify-end gap-2 pt-4">
                <app-button variant="outline" size="sm" (btnClick)="closePanel()">{{ translationService.t('common.cancel') }}</app-button>
                <app-button variant="primary" size="sm" [disabled]="!canApprove() || actionProcessing" (btnClick)="submitApprove()">
                  {{ actionProcessing ? translationService.t('common.saving') : translationService.t('business.details.approve') }}
                </app-button>
              </div>
            }

            <!-- More info / Reject -->
            @if (activePanel === 'moreInfo' || activePanel === 'reject') {
              <h3 class="mb-1 text-m3-title-md font-semibold text-[color:var(--color-on-surface)]">
                {{ translationService.t(activePanel === 'moreInfo' ? 'business.details.moreInfoTitle' : 'business.details.rejectTitle') }}
              </h3>
              <p class="mb-4 text-xs text-[color:var(--color-on-surface-variant)]">
                {{ translationService.t(activePanel === 'moreInfo' ? 'business.details.moreInfoHint' : 'business.details.rejectHint') }}
              </p>
              <div class="space-y-3">
                <div>
                  <label class="mb-1 block text-sm font-medium">{{ translationService.t('business.details.reasonCode') }} *</label>
                  <select [(ngModel)]="reasonCode" class="form-input w-full text-sm">
                    <option value="">{{ translationService.t('business.details.selectReason') }}</option>
                    @for (code of reasonCodes; track code) {
                      <option [value]="code">{{ translationService.t('business.reason.' + code) }}</option>
                    }
                  </select>
                </div>
                @if (activePanel === 'moreInfo') {
                  <div>
                    <label class="mb-1 block text-sm font-medium">{{ translationService.t('business.details.missingItems') }}</label>
                    <div class="flex flex-wrap gap-3">
                      @for (item of missingItemOptions; track item) {
                        <label class="flex items-center gap-1.5 text-sm">
                          <input type="checkbox" [checked]="missingItems.has(item)" (change)="toggleMissingItem(item)" />
                          {{ translationService.t('business.missing.' + item) }}
                        </label>
                      }
                    </div>
                  </div>
                }
                <div>
                  <label class="mb-1 block text-sm font-medium">{{ translationService.t('business.details.userMessage') }}</label>
                  <textarea [(ngModel)]="userMessage" rows="3" class="form-input w-full text-sm"
                            [placeholder]="translationService.t('business.details.userMessagePlaceholder')"></textarea>
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium">{{ translationService.t('business.details.internalNote') }}</label>
                  <textarea [(ngModel)]="internalNote" rows="2" class="form-input w-full text-sm"></textarea>
                </div>
                <div class="flex justify-end gap-2 pt-2">
                  <app-button variant="outline" size="sm" (btnClick)="closePanel()">{{ translationService.t('common.cancel') }}</app-button>
                  <app-button [variant]="activePanel === 'reject' ? 'danger' : 'primary'" size="sm"
                              [disabled]="!reasonCode || actionProcessing"
                              (btnClick)="activePanel === 'moreInfo' ? submitMoreInfo() : submitReject()">
                    {{ actionProcessing ? translationService.t('common.saving') : translationService.t(activePanel === 'moreInfo' ? 'business.details.requestMoreInfo' : 'business.details.reject') }}
                  </app-button>
                </div>
              </div>
            }
        </div>
      </ng-template>

      <app-confirm-dialog
        [open]="revokeConfirmOpen"
        variant="destructive"
        [title]="translationService.t('business.details.revokeConfirmTitle')"
        [message]="translationService.t('business.details.revokeConfirmMessage')"
        [confirmLabel]="translationService.t('business.details.revoke')"
        [cancelLabel]="translationService.t('common.cancel')"
        [processing]="actionProcessing"
        (confirmed)="submitRevoke()"
        (cancelled)="revokeConfirmOpen = false" />
    }
  `,
})
export class BusinessRequestDetailsComponent implements OnInit, OnDestroy {
  request: BusinessRequestDetails | null = null;
  possibleDuplicate = false;
  events: BusinessRequestEvent[] = [];
  identitySummary: BusinessIdentitySummary | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  requestId = 0;

  docLicense: SecureDocument | null = null;
  docAuthorization: SecureDocument | null = null;

  activePanel: ActionPanel = 'none';
  actionProcessing = false;
  revokeConfirmOpen = false;

  @ViewChild('actionPanelDialog') actionPanelDialog!: TemplateRef<unknown>;
  private panelRef: MatDialogRef<unknown> | null = null;

  // License check
  checkAuthority: BusinessAuthority | '' = '';
  checkAuthorityName = '';
  checkLicenseNumber = '';
  licenseCheckState: LicenseCheckState = 'idle';
  licenseCheckError = '';
  licenseClaimedUserId: number | null = null;

  // Approve form
  approveLegalName = '';
  approveLicenseNumber = '';
  approveAuthority: BusinessAuthority | '' = '';
  approveAuthorityName = '';
  approveLicenseExpiry = '';
  approveTradeName = '';
  approveBusinessKind: BusinessKind | '' = '';
  approveActivityType: BusinessActivity | '' = '';
  approveEmirateStateId: number | null = null;
  approveInternalNote = '';

  /** UAE states for the emirate picker (from LookupService). */
  emirates: StateEmirate[] = [];

  // More-info / reject form
  reasonCode: BusinessReasonCode | '' = '';
  userMessage = '';
  internalNote = '';
  missingItems = new Set<BusinessMissingItem>();

  readonly reasonCodes = BUSINESS_REASON_CODES;
  readonly missingItemOptions = BUSINESS_MISSING_ITEMS;
  readonly authorities = BUSINESS_AUTHORITIES;
  readonly businessKinds = BUSINESS_KINDS;
  readonly businessActivities = BUSINESS_ACTIVITIES;
  readonly isFutureDubaiDate = isFutureDubaiDate;

  private destroy$ = new Subject<void>();

  constructor(
    public translationService: TranslationService,
    public lookup: LookupService,
    private route: ActivatedRoute,
    private businessService: BusinessService,
    private errorHandler: ErrorHandlerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadEmirates();
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          this.requestId = Number(params.get('id')) || 0;
          this.isLoading = true;
          this.errorMessage = '';
          this.successMessage = '';
          return this.businessService.getById(this.requestId);
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

  /** Loads UAE states once for the approve form's emirate picker. */
  private loadEmirates(): void {
    this.lookup.getCountries().subscribe((countries) => {
      const uae = countries.find((c) => c.code === 'AE');
      if (!uae) return;
      this.lookup.getStatesByCountry(uae.id).subscribe((states) => {
        this.emirates = states;
      });
    });
  }

  /** Localized state/country name based on the active UI language. */
  lookupName(item: StateEmirate): string {
    return this.translationService.currentLanguageValue === 'ar' ? item.name_ar : item.name_en;
  }

  ngOnDestroy(): void {
    this.panelRef?.close();
    this.destroy$.next();
    this.destroy$.complete();
  }

  reload(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.businessService.getById(this.requestId).subscribe({
      next: (response) => this.applyResponse(response),
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.errorHandler.handleError(error).message;
      },
    });
  }

  private applyResponse(response: { status: string; message?: string; data?: BusinessDetailsData }): void {
    this.isLoading = false;
    if (response.status === 'success' && response.data) {
      this.request = response.data.request;
      // viewUrls / events / identitySummary / possibleDuplicate are siblings of `request` in `data`.
      this.possibleDuplicate = !!response.data.possibleDuplicate;
      this.events = response.data.events || [];
      this.identitySummary = response.data.identitySummary || null;
      const urls = response.data.viewUrls;
      this.docLicense = this.toSecureDoc(urls?.license);
      this.docAuthorization = this.toSecureDoc(urls?.authorization);
    } else {
      this.errorMessage = response.message || this.translationService.t('business.details.loadFailed');
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
    if (panel === 'approve' && this.request) {
      // Prefill from claimed values; the reviewer verifies against the document.
      this.approveLegalName = this.request.legal_name || '';
      this.approveTradeName = this.request.trade_name || '';
      this.approveEmirateStateId = this.request.emirate_state_id ?? null;
      this.checkAuthority = (this.request.authority_code as BusinessAuthority) || '';
      this.checkAuthorityName = this.request.authority_name || '';
      this.approveAuthority = this.checkAuthority;
      this.approveAuthorityName = this.checkAuthorityName;
      this.resetLicenseCheck();
    }
    // Template-ref dialog: the ng-template keeps this component as its context.
    this.panelRef = this.dialog.open(this.actionPanelDialog, {
      width: '672px',
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

  toggleMissingItem(item: BusinessMissingItem): void {
    if (this.missingItems.has(item)) this.missingItems.delete(item);
    else this.missingItems.add(item);
  }

  // --- License check -------------------------------------------------------

  /** Any change to authority/number invalidates a previous check result. */
  resetLicenseCheck(): void {
    this.licenseCheckState = 'idle';
    this.licenseCheckError = '';
    this.licenseClaimedUserId = null;
  }

  canCheckLicense(): boolean {
    if (!this.checkAuthority || !this.checkLicenseNumber.trim()) return false;
    if (this.checkAuthority === 'OTHER_FREEZONE' && !this.checkAuthorityName.trim()) return false;
    return true;
  }

  runLicenseCheck(): void {
    if (!this.canCheckLicense()) return;
    this.licenseCheckState = 'checking';
    this.licenseCheckError = '';
    this.businessService.checkLicense({
      authorityCode: this.checkAuthority as BusinessAuthority,
      authorityName: this.checkAuthority === 'OTHER_FREEZONE' ? this.checkAuthorityName.trim() : null,
      licenseNumber: this.checkLicenseNumber.trim(),
    }).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.licenseCheckState = response.data.claimed ? 'claimed' : 'available';
          this.licenseClaimedUserId = response.data.claimed ? (response.data.claimedUserId ?? null) : null;
        } else {
          this.licenseCheckState = 'error';
          this.licenseCheckError = response.message || this.translationService.t('business.details.licenseCheckFailed');
        }
      },
      error: (error) => {
        this.licenseCheckState = 'error';
        this.licenseCheckError = this.errorHandler.handleError(error).message;
      },
    });
  }

  // --- Approve -------------------------------------------------------------

  canApprove(): boolean {
    if (!this.approveLegalName.trim() || !this.approveLicenseNumber.trim()) return false;
    if (!this.approveAuthority) return false;
    if (this.approveAuthority === 'OTHER_FREEZONE' && !this.approveAuthorityName.trim()) return false;
    if (!isFutureDubaiDate(this.approveLicenseExpiry)) return false;
    if (!this.approveTradeName.trim() || !this.approveBusinessKind || !this.approveActivityType) return false;
    if (!this.approveEmirateStateId) return false;
    if (this.licenseCheckState !== 'available') return false;
    return true;
  }

  submitApprove(): void {
    if (!this.canApprove() || this.actionProcessing) return;
    this.actionProcessing = true;
    this.businessService.approve({
      requestId: this.requestId,
      legalNameFromDocument: this.approveLegalName.trim(),
      licenseNumberFromDocument: this.approveLicenseNumber.trim(),
      authorityCodeFromDocument: this.approveAuthority as BusinessAuthority,
      authorityNameFromDocument: this.approveAuthority === 'OTHER_FREEZONE' ? this.approveAuthorityName.trim() : null,
      licenseExpiryDateFromDocument: this.approveLicenseExpiry,
      tradeNameConfirmed: this.approveTradeName.trim(),
      businessKindConfirmed: this.approveBusinessKind as BusinessKind,
      activityTypeConfirmed: this.approveActivityType as BusinessActivity,
      emirateStateIdConfirmed: this.approveEmirateStateId as number,
      internalNote: this.approveInternalNote || undefined,
    }).subscribe({
      next: () => this.onActionSuccess('business.details.approveSuccess'),
      error: (error) => this.onActionError(error),
    });
  }

  // --- More info / Reject / Revoke -----------------------------------------

  submitMoreInfo(): void {
    if (!this.reasonCode || this.actionProcessing) return;
    this.actionProcessing = true;
    this.businessService.requestMoreInfo({
      requestId: this.requestId,
      reasonCode: this.reasonCode as BusinessReasonCode,
      userMessage: this.userMessage || undefined,
      missingItems: this.missingItems.size ? [...this.missingItems] : undefined,
      internalNote: this.internalNote || undefined,
    }).subscribe({
      next: () => this.onActionSuccess('business.details.moreInfoSuccess'),
      error: (error) => this.onActionError(error),
    });
  }

  submitReject(): void {
    if (!this.reasonCode || this.actionProcessing) return;
    this.actionProcessing = true;
    this.businessService.reject({
      requestId: this.requestId,
      reasonCode: this.reasonCode as BusinessReasonCode,
      userMessage: this.userMessage || undefined,
      internalNote: this.internalNote || undefined,
    }).subscribe({
      next: () => this.onActionSuccess('business.details.rejectSuccess'),
      error: (error) => this.onActionError(error),
    });
  }

  submitRevoke(): void {
    if (!this.request || this.actionProcessing) return;
    this.actionProcessing = true;
    this.businessService.revoke({
      userId: this.request.user_id,
      reasonCode: 'policy_violation',
      internalNote: this.internalNote || undefined,
    }).subscribe({
      next: () => {
        this.revokeConfirmOpen = false;
        this.onActionSuccess('business.details.revokeSuccess');
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
    this.reload();
  }

  private onActionError(error: HttpErrorResponse): void {
    this.actionProcessing = false;
    this.errorMessage = this.errorHandler.handleError(error).message;
    // After an uncertain error, refetch rather than retry.
    this.reload();
  }
}
