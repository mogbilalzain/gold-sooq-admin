import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { PageHeaderComponent } from '../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/common/loading-spinner/loading-spinner.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { ConfirmDialogComponent } from '../../../shared/components/common/confirm-dialog/confirm-dialog.component';
import { TranslationService } from '../../../shared/services/translation.service';
import {
  ContactMessagesService,
  ContactMessage,
  ContactMessageStatus,
  CONTACT_MESSAGE_STATUSES,
} from '../../../shared/services/data/contact-messages.service';
import { ErrorHandlerService } from '../../../shared/services/api/error-handler.service';
import { contactStatusPillClass } from '../contact-messages.component';

/** Contact message details: sender info, message body, status/notes update, delete. */
@Component({
  selector: 'app-contact-message-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    ButtonComponent,
    ConfirmDialogComponent,
  ],
  template: `
    <app-page-header
      [title]="translationService.t('contactMessages.details.title') + ' #' + messageId"
      [subtitle]="translationService.t('contactMessages.details.subtitle')">
    </app-page-header>

    <div class="mb-4">
      <a routerLink="/contact-messages"
         class="font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300 transition-colors">
        → {{ translationService.t('contactMessages.details.backToList') }}
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
    } @else if (message) {
      <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <!-- Message -->
        <div class="space-y-4 xl:col-span-2">
          <div class="modern-card !p-5">
            <div class="mb-3 flex flex-wrap items-center gap-2">
              <span class="status-pill" [ngClass]="statusPillClass(message.status)">
                {{ translationService.t('contactMessages.status.' + message.status) }}
              </span>
              @if (message.inquiry_type) {
                <span class="text-xs font-medium text-[color:var(--color-on-surface-variant)]">{{ message.inquiry_type }}</span>
              }
            </div>
            <h3 class="mb-3 text-m3-title-lg font-semibold text-[color:var(--color-on-surface)]">{{ message.subject }}</h3>
            <p class="whitespace-pre-line break-words text-m3-body-lg leading-7 text-[color:var(--color-on-surface)]">{{ message.message_body }}</p>
          </div>

          <!-- Management -->
          <div class="modern-card !p-5">
            <h3 class="mb-3 text-m3-title-sm font-semibold text-[color:var(--color-on-surface)]">{{ translationService.t('contactMessages.details.manage') }}</h3>
            <div class="space-y-3">
              <div>
                <label for="contact-status" class="mb-1 block text-sm font-medium">{{ translationService.t('contactMessages.list.status') }}</label>
                <select id="contact-status" [(ngModel)]="editStatus" class="form-input w-full text-sm md:w-64">
                  @for (status of statuses; track status) {
                    <option [value]="status">{{ translationService.t('contactMessages.status.' + status) }}</option>
                  }
                </select>
              </div>
              <div>
                <label for="contact-notes" class="mb-1 block text-sm font-medium">{{ translationService.t('contactMessages.details.adminNotes') }}</label>
                <textarea id="contact-notes" [(ngModel)]="editNotes" rows="4" maxlength="2000"
                          class="form-input w-full text-sm"
                          [placeholder]="translationService.t('contactMessages.details.adminNotesPlaceholder')"></textarea>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <app-button variant="primary" size="sm" [disabled]="isSaving || !hasChanges()" (btnClick)="save()">
                  {{ isSaving ? translationService.t('common.loading') : translationService.t('contactMessages.details.save') }}
                </app-button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sender + delete -->
        <div class="space-y-4">
          <div class="modern-card !p-5">
            <h3 class="mb-3 text-m3-title-sm font-semibold text-[color:var(--color-on-surface)]">{{ translationService.t('contactMessages.details.senderInfo') }}</h3>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between gap-3">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('contactMessages.details.fullName') }}</dt>
                <dd class="font-medium text-end">{{ message.full_name }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('contactMessages.details.phone') }}</dt>
                <dd class="font-medium" dir="ltr">
                  <a [href]="'tel:' + message.phone_code + message.phone" class="text-brand-700 dark:text-brand-400">
                    {{ message.phone_code }} {{ message.phone }}
                  </a>
                </dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('contactMessages.details.email') }}</dt>
                <dd class="font-medium break-all" dir="ltr">
                  <a [href]="'mailto:' + message.email" class="text-brand-700 dark:text-brand-400">{{ message.email }}</a>
                </dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('contactMessages.details.referenceNumber') }}</dt>
                <dd class="font-medium" dir="ltr">{{ message.reference_number || '-' }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('contactMessages.list.inquiryType') }}</dt>
                <dd class="font-medium text-end">{{ message.inquiry_type || '-' }}</dd>
              </div>
              <div class="flex justify-between gap-3">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('contactMessages.list.receivedAt') }}</dt>
                <dd class="font-medium" dir="ltr">{{ message.created_at | date:'yyyy-MM-dd HH:mm' }}</dd>
              </div>
              @if (message.updated_at) {
                <div class="flex justify-between gap-3">
                  <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('contactMessages.details.updatedAt') }}</dt>
                  <dd class="font-medium" dir="ltr">{{ message.updated_at | date:'yyyy-MM-dd HH:mm' }}</dd>
                </div>
              }
            </dl>
          </div>

          <div class="modern-card !p-5">
            <h3 class="mb-2 text-m3-title-sm font-semibold text-[color:var(--color-on-surface)]">{{ translationService.t('contactMessages.details.delete') }}</h3>
            <p class="mb-3 text-xs text-[color:var(--color-on-surface-variant)]">
              {{ translationService.t('contactMessages.details.deleteWarning') }}
            </p>
            <app-button variant="danger" size="sm" (btnClick)="deleteConfirmOpen = true">
              {{ translationService.t('contactMessages.details.delete') }}
            </app-button>
          </div>
        </div>
      </div>

      <app-confirm-dialog
        [open]="deleteConfirmOpen"
        variant="destructive"
        [title]="translationService.t('contactMessages.details.deleteTitle')"
        [message]="translationService.t('contactMessages.details.deleteWarning')"
        [confirmLabel]="translationService.t('contactMessages.details.delete')"
        [processing]="isDeleting"
        (confirmed)="confirmDelete()"
        (cancelled)="deleteConfirmOpen = false" />
    }
  `,
})
export class ContactMessageDetailsComponent implements OnInit, OnDestroy {
  messageId = 0;
  message: ContactMessage | null = null;
  isLoading = false;
  isSaving = false;
  isDeleting = false;
  deleteConfirmOpen = false;
  errorMessage = '';
  successMessage = '';

  editStatus: ContactMessageStatus = 'read';
  editNotes = '';

  readonly statuses = CONTACT_MESSAGE_STATUSES;
  readonly statusPillClass = contactStatusPillClass;

  private destroy$ = new Subject<void>();

  constructor(
    public translationService: TranslationService,
    private route: ActivatedRoute,
    private router: Router,
    private contactMessagesService: ContactMessagesService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          this.messageId = Number(params.get('id')) || 0;
          this.isLoading = true;
          this.errorMessage = '';
          this.successMessage = '';
          return this.contactMessagesService.getById(this.messageId);
        })
      )
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.status === 'success' && response.data) {
            this.applyMessage(response.data);
          } else {
            this.errorMessage = response.message || this.translationService.t('contactMessages.details.loadFailed');
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = this.errorHandler.handleError(error).message;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  hasChanges(): boolean {
    if (!this.message) return false;
    return this.editStatus !== this.message.status
      || this.editNotes.trim() !== (this.message.admin_notes ?? '').trim();
  }

  save(): void {
    if (!this.message || this.isSaving) return;
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';
    const notes = this.editNotes.trim();
    this.contactMessagesService.updateStatus({
      messageId: this.messageId,
      status: this.editStatus,
      admin_notes: notes || undefined,
    }).subscribe({
      next: (response) => {
        this.isSaving = false;
        if (response.status === 'success') {
          this.applyMessage({
            ...this.message!,
            ...(response.data ?? {}),
            status: response.data?.status ?? this.editStatus,
            admin_notes: response.data?.admin_notes ?? (notes || null),
          });
          this.successMessage = this.translationService.t('contactMessages.details.saveSuccess');
        } else {
          this.errorMessage = response.message || this.translationService.t('contactMessages.details.saveFailed');
        }
      },
      error: (error) => {
        this.isSaving = false;
        this.errorMessage = this.errorHandler.handleError(error).message;
      },
    });
  }

  confirmDelete(): void {
    if (this.isDeleting) return;
    this.isDeleting = true;
    this.errorMessage = '';
    this.contactMessagesService.delete(this.messageId).subscribe({
      next: (response) => {
        this.isDeleting = false;
        this.deleteConfirmOpen = false;
        if (response.status === 'success') {
          this.router.navigate(['/contact-messages']);
        } else {
          this.errorMessage = response.message || this.translationService.t('contactMessages.details.deleteFailed');
        }
      },
      error: (error) => {
        this.isDeleting = false;
        this.deleteConfirmOpen = false;
        this.errorMessage = this.errorHandler.handleError(error).message;
      },
    });
  }

  private applyMessage(message: ContactMessage): void {
    this.message = message;
    this.editStatus = message.status;
    this.editNotes = message.admin_notes ?? '';
  }
}
