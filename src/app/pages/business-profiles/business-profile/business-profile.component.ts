import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { PageHeaderComponent } from '../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/common/loading-spinner/loading-spinner.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { SafeImageComponent } from '../../../shared/components/common/safe-image/safe-image.component';
import { ImageUploaderComponent } from '../../../shared/components/common/image-uploader/image-uploader.component';
import { MatButtonModule } from '@angular/material/button';
import { TranslationService } from '../../../shared/services/translation.service';
import {
  BusinessService,
  BusinessPublicProfile,
  UpdateBusinessProfilePayload,
  SocialLink,
  WorkingHoursEntry,
} from '../../../shared/services/data/business.service';
import { ErrorHandlerService } from '../../../shared/services/api/error-handler.service';

const DESCRIPTION_MAX = 2000;
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Business public profile — view + partial-update editing.
 * - Only changed fields are sent; arrays are sent whole when changed.
 * - Removing the logo/cover sends an explicit null.
 * - NOT_A_BUSINESS_PROFILE renders a dedicated screen.
 */
@Component({
  selector: 'app-business-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    ButtonComponent,
    SafeImageComponent,
    ImageUploaderComponent,
    MatButtonModule,
  ],
  template: `
    <app-page-header
      [title]="translationService.t('businessProfile.title')"
      [subtitle]="translationService.t('businessProfile.subtitle')">
    </app-page-header>

    @if (errorMessage && !notABusiness) {
      <div class="mb-4 p-3 text-sm rounded-xl status-pill-error">{{ errorMessage }}</div>
    }
    @if (successMessage) {
      <div class="mb-4 p-3 text-sm rounded-xl status-pill-success">{{ successMessage }}</div>
    }

    @if (isLoading) {
      <app-loading-spinner />
    } @else if (notABusiness) {
      <!-- Dedicated screen for NOT_A_BUSINESS_PROFILE -->
      <div class="modern-card !p-12 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-warning-50 text-warning-500 dark:bg-warning-500/10">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
          </svg>
        </div>
        <h2 class="text-m3-title-lg font-semibold text-[color:var(--color-on-surface)]">{{ translationService.t('businessProfile.notABusinessTitle') }}</h2>
        <p class="mt-2 text-sm text-[color:var(--color-on-surface-variant)]">{{ translationService.t('businessProfile.notABusinessMessage') }}</p>
        <div class="mt-6 flex justify-center gap-3">
          <a matButton="outlined" [routerLink]="['/users', userId]">{{ translationService.t('businessProfile.viewUserProfile') }}</a>
          <a matButton="outlined" routerLink="/business-requests">{{ translationService.t('businessProfile.viewRequests') }}</a>
        </div>
      </div>
    } @else if (profile) {
      <!-- Summary header -->
      <div class="modern-card !p-6 mb-6">
        <div class="flex flex-wrap items-center gap-4">
          <app-safe-image
            [src]="profile.logoUrl"
            [alt]="profile.tradeName || ''"
            imgClass="h-16 w-16 rounded-2xl object-cover"
            placeholderClass="h-16 w-16 rounded-2xl"
            [placeholderText]="(profile.tradeName || '?').charAt(0)" />
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-m3-title-lg font-semibold text-[color:var(--color-on-surface)]">{{ profile.tradeName || profile.legalName || ('#' + userId) }}</h2>
              <span class="status-pill" [ngClass]="profileStatusPillClass()">
                {{ translationService.t('businessProfile.status.' + (profile.profileStatus || 'unverified')) }}
              </span>
            </div>
            <p class="text-sm text-[color:var(--color-on-surface-variant)]">
              {{ profile.legalName || '' }}
              @if (profile.licenseNumberLast4) {
                · {{ translationService.t('businessProfile.licenseEndingIn') }} {{ profile.licenseNumberLast4 }}
              }
              @if (profile.licenseExpiresOn) {
                · {{ translationService.t('business.details.licenseExpiry') }}: {{ profile.licenseExpiresOn | date:'yyyy-MM-dd' }}
              }
            </p>
          </div>
          @if (!editMode) {
            <app-button variant="outline" size="sm" (btnClick)="enterEdit()">
              {{ translationService.t('common.edit') }}
            </app-button>
          }
        </div>
      </div>

      @if (!editMode) {
        <!-- VIEW MODE -->
        <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div class="modern-card !p-6">
            <h3 class="mb-4 text-m3-title-sm font-semibold text-[color:var(--color-on-surface)]">{{ translationService.t('userProfile.businessInfo') }}</h3>
            <dl class="space-y-3 text-sm">
              <div class="flex justify-between gap-4">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('userProfile.businessKind') }}</dt>
                <dd class="font-medium">{{ profile.businessKind ? translationService.t('business.kind.' + profile.businessKind) : '-' }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('userProfile.activityType') }}</dt>
                <dd class="font-medium">{{ profile.activityType ? translationService.t('business.activity.' + profile.activityType) : '-' }}</dd>
              </div>
              @if (profile.authorityName) {
                <div class="flex justify-between gap-4">
                  <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('business.list.authority') }}</dt>
                  <dd class="font-medium">{{ profile.authorityName }}</dd>
                </div>
              }
              <div class="flex justify-between gap-4">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('userProfile.contactPhone') }}</dt>
                <dd class="font-medium" dir="ltr">{{ profile.contactPhone || '-' }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('userProfile.contactEmail') }}</dt>
                <dd class="font-medium">{{ profile.contactEmail || '-' }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('userProfile.website') }}</dt>
                <dd class="font-medium">
                  @if (profile.websiteUrl) {
                    <a [href]="profile.websiteUrl" target="_blank" rel="noopener" class="text-brand-700 dark:text-brand-400">{{ profile.websiteUrl }}</a>
                  } @else { - }
                </dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('userProfile.address') }}</dt>
                <dd class="font-medium">{{ profile.addressLine || '-' }}</dd>
              </div>
              @if (profile.description) {
                <div>
                  <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('userProfile.description') }}</dt>
                  <dd class="mt-1 whitespace-pre-wrap font-medium">{{ profile.description }}</dd>
                </div>
              }
            </dl>
          </div>

          <div class="space-y-6">
            @if (profile.coverUrl) {
              <app-safe-image
                [src]="profile.coverUrl"
                [alt]="profile.tradeName || ''"
                imgClass="h-44 w-full rounded-2xl object-cover"
                placeholderClass="h-44 w-full rounded-2xl" />
            }
            @if (profile.socialLinks && profile.socialLinks.length) {
              <div class="modern-card !p-6">
                <h3 class="mb-3 text-m3-title-sm font-semibold text-[color:var(--color-on-surface)]">{{ translationService.t('userProfile.socialLinks') }}</h3>
                <ul class="space-y-1.5 text-sm">
                  @for (link of profile.socialLinks; track link.platform + link.url) {
                    <li>
                      <span class="font-medium">{{ link.platform }}:</span>
                      <a [href]="link.url" target="_blank" rel="noopener" class="text-brand-700 dark:text-brand-400">{{ link.url }}</a>
                    </li>
                  }
                </ul>
              </div>
            }
            @if (profile.workingHours && profile.workingHours.length) {
              <div class="modern-card !p-6">
                <h3 class="mb-3 text-m3-title-sm font-semibold text-[color:var(--color-on-surface)]">{{ translationService.t('userProfile.workingHours') }}</h3>
                <ul class="space-y-1.5 text-sm">
                  @for (hours of profile.workingHours; track hours.day) {
                    <li class="flex justify-between gap-4">
                      <span>{{ translationService.t('business.days.' + hours.day) }}</span>
                      <span class="font-medium" dir="ltr">
                        {{ hours.closed ? translationService.t('business.closed') : (hours.open + ' - ' + hours.close) }}
                      </span>
                    </li>
                  }
                </ul>
              </div>
            }
          </div>
        </div>
      } @else {
        <!-- EDIT MODE -->
        <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div class="space-y-6">
            <div class="modern-card !p-6">
              <h3 class="mb-4 text-m3-title-sm font-semibold text-[color:var(--color-on-surface)]">{{ translationService.t('businessProfile.images') }}</h3>
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <app-image-uploader
                  type="business_logo"
                  [label]="translationService.t('businessProfile.logo')"
                  [existingImageUrl]="logoRemoved ? null : profile.logoUrl"
                  (uploaded)="onLogoUploaded($event)"
                  (cleared)="onLogoCleared()"
                  (uploadingChange)="uploading = $event" />
                <app-image-uploader
                  type="business_cover"
                  [label]="translationService.t('businessProfile.cover')"
                  [existingImageUrl]="coverRemoved ? null : profile.coverUrl"
                  (uploaded)="onCoverUploaded($event)"
                  (cleared)="onCoverCleared()"
                  (uploadingChange)="uploading = $event" />
              </div>
            </div>

            <div class="modern-card !p-6">
              <h3 class="mb-4 text-m3-title-sm font-semibold text-[color:var(--color-on-surface)]">{{ translationService.t('businessProfile.basicInfo') }}</h3>
              <div class="space-y-3">
                <div>
                  <label class="mb-1 block text-sm font-medium">{{ translationService.t('businessProfile.tradeName') }}</label>
                  <input type="text" [(ngModel)]="form.tradeName" class="form-input w-full text-sm" />
                  <p class="mt-1 text-xs text-[color:var(--color-on-surface-variant)]">{{ translationService.t('businessProfile.tradeNameAdminOnly') }}</p>
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium">{{ translationService.t('userProfile.description') }}</label>
                  <textarea [(ngModel)]="form.description" rows="4" maxlength="2000" class="form-input w-full text-sm"></textarea>
                  <p class="mt-1 text-xs" [class.text-error-500]="form.description.length > descriptionMax"
                     [class.text-[color:var(--color-on-surface-variant)]]="form.description.length <= descriptionMax">
                    {{ form.description.length }}/{{ descriptionMax }}
                  </p>
                </div>
                <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label class="mb-1 block text-sm font-medium">{{ translationService.t('userProfile.contactPhone') }}</label>
                    <input type="text" [(ngModel)]="form.contactPhone" dir="ltr" class="form-input w-full text-sm" />
                  </div>
                  <div>
                    <label class="mb-1 block text-sm font-medium">{{ translationService.t('userProfile.contactEmail') }}</label>
                    <input type="email" [(ngModel)]="form.contactEmail" dir="ltr" class="form-input w-full text-sm" />
                  </div>
                  <div>
                    <label class="mb-1 block text-sm font-medium">{{ translationService.t('userProfile.website') }}</label>
                    <input type="url" [(ngModel)]="form.websiteUrl" dir="ltr" class="form-input w-full text-sm" />
                  </div>
                  <div>
                    <label class="mb-1 block text-sm font-medium">{{ translationService.t('userProfile.address') }}</label>
                    <input type="text" [(ngModel)]="form.addressLine" class="form-input w-full text-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <!-- Social links editor -->
            <div class="modern-card !p-6">
              <div class="mb-3 flex items-center justify-between">
                <h3 class="text-m3-title-sm font-semibold text-[color:var(--color-on-surface)]">{{ translationService.t('userProfile.socialLinks') }}</h3>
                <app-button variant="outline" size="sm" (btnClick)="addSocialLink()">
                  + {{ translationService.t('common.add') }}
                </app-button>
              </div>
              @if (form.socialLinks.length === 0) {
                <p class="text-sm text-[color:var(--color-on-surface-variant)]">{{ translationService.t('businessProfile.noSocialLinks') }}</p>
              }
              <div class="space-y-2">
                @for (link of form.socialLinks; track $index) {
                  <div class="flex items-center gap-2">
                    <input type="text" [(ngModel)]="link.platform" class="form-input w-32 text-sm"
                           [placeholder]="translationService.t('businessProfile.platform')" />
                    <input type="url" [(ngModel)]="link.url" dir="ltr" class="form-input flex-1 text-sm" placeholder="https://…" />
                    <button type="button" (click)="removeSocialLink($index)"
                            class="text-error-500 hover:text-error-600" [attr.aria-label]="translationService.t('common.delete')">✕</button>
                  </div>
                }
              </div>
            </div>

            <!-- Working hours editor -->
            <div class="modern-card !p-6">
              <h3 class="mb-3 text-m3-title-sm font-semibold text-[color:var(--color-on-surface)]">{{ translationService.t('userProfile.workingHours') }}</h3>
              <div class="space-y-2">
                @for (entry of form.workingHours; track entry.day) {
                  <div class="flex items-center gap-2 text-sm">
                    <span class="w-24">{{ translationService.t('business.days.' + entry.day) }}</span>
                    <label class="flex items-center gap-1.5">
                      <input type="checkbox" [(ngModel)]="entry.closed" />
                      <span class="text-xs">{{ translationService.t('business.closed') }}</span>
                    </label>
                    @if (!entry.closed) {
                      <input type="time" [(ngModel)]="entry.open" dir="ltr" class="form-input !w-auto text-sm" />
                      <span>—</span>
                      <input type="time" [(ngModel)]="entry.close" dir="ltr" class="form-input !w-auto text-sm" />
                    }
                  </div>
                }
              </div>
            </div>

            <!-- Edit actions -->
            <div class="modern-card !p-6">
              <div class="flex justify-end gap-2">
                <app-button variant="outline" size="sm" [disabled]="saving" (btnClick)="cancelEdit()">
                  {{ translationService.t('common.cancel') }}
                </app-button>
                <app-button variant="primary" size="sm" [disabled]="!canSave()" (btnClick)="save()">
                  {{ saving ? translationService.t('common.saving') : translationService.t('common.save') }}
                </app-button>
              </div>
              @if (!hasChanges()) {
                <p class="mt-2 text-end text-xs text-[color:var(--color-on-surface-variant)]">{{ translationService.t('businessProfile.noChanges') }}</p>
              }
            </div>
          </div>
        </div>
      }
    }
  `,
})
export class BusinessProfileComponent implements OnInit, OnDestroy {
  profile: BusinessPublicProfile | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  notABusiness = false;
  userId = 0;

  editMode = false;
  saving = false;
  uploading = false;
  readonly descriptionMax = DESCRIPTION_MAX;

  form = {
    tradeName: '',
    description: '',
    contactPhone: '',
    contactEmail: '',
    websiteUrl: '',
    addressLine: '',
    socialLinks: [] as SocialLink[],
    workingHours: [] as WorkingHoursEntry[],
  };

  private originalForm = '';
  private logoKey: string | null | undefined = undefined; // undefined = unchanged
  private coverKey: string | null | undefined = undefined;
  logoRemoved = false;
  coverRemoved = false;

  private destroy$ = new Subject<void>();

  constructor(
    public translationService: TranslationService,
    private route: ActivatedRoute,
    private businessService: BusinessService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          this.userId = Number(params.get('userId')) || 0;
          this.isLoading = true;
          this.errorMessage = '';
          this.successMessage = '';
          this.notABusiness = false;
          this.editMode = false;
          return this.businessService.getPublicProfile(this.userId);
        })
      )
      .subscribe({
        next: (response) => this.applyResponse(response),
        error: (error) => this.handleError(error),
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private applyResponse(response: { status: string; message?: string; data?: BusinessPublicProfile }): void {
    this.isLoading = false;
    if (response.status === 'success' && response.data) {
      this.profile = response.data;
      this.notABusiness = false;
    } else {
      this.errorMessage = response.message || this.translationService.t('businessProfile.loadFailed');
    }
  }

  private handleError(error: HttpErrorResponse): void {
    this.isLoading = false;
    const apiError = this.errorHandler.handleError(error);
    const code = (apiError as { code?: string }).code;
    if (code === 'NOT_A_BUSINESS_PROFILE' || apiError.message?.includes('NOT_A_BUSINESS_PROFILE')) {
      this.notABusiness = true;
      this.profile = null;
      return;
    }
    this.errorMessage = apiError.message;
  }

  profileStatusPillClass(): string {
    switch (this.profile?.profileStatus) {
      case 'verified': return 'status-pill-success';
      case 'expired': return 'status-pill-warning';
      case 'revoked': return 'status-pill-error';
      default: return '';
    }
  }

  // --- Edit mode -----------------------------------------------------------

  enterEdit(): void {
    if (!this.profile) return;
    this.form = {
      tradeName: this.profile.tradeName || '',
      description: this.profile.description || '',
      contactPhone: this.profile.contactPhone || '',
      contactEmail: this.profile.contactEmail || '',
      websiteUrl: this.profile.websiteUrl || '',
      addressLine: this.profile.addressLine || '',
      socialLinks: (this.profile.socialLinks || []).map((l) => ({ ...l })),
      workingHours: this.buildWorkingHours(this.profile.workingHours),
    };
    this.originalForm = JSON.stringify(this.form);
    this.logoKey = undefined;
    this.coverKey = undefined;
    this.logoRemoved = false;
    this.coverRemoved = false;
    this.editMode = true;
    this.successMessage = '';
  }

  cancelEdit(): void {
    this.editMode = false;
  }

  private buildWorkingHours(existing: WorkingHoursEntry[] | undefined): WorkingHoursEntry[] {
    // Structured editor: always show all 7 weekdays; keep API values for known days.
    const byDay = new Map((existing || []).map((e) => [e.day, e]));
    return WEEKDAYS.map((day) => {
      const found = byDay.get(day);
      return found
        ? { day, open: found.open || '', close: found.close || '', closed: !!found.closed }
        : { day, open: '09:00', close: '18:00', closed: false };
    });
  }

  addSocialLink(): void {
    this.form.socialLinks.push({ platform: '', url: '' });
  }

  removeSocialLink(index: number): void {
    this.form.socialLinks.splice(index, 1);
  }

  onLogoUploaded(storageKey: string): void {
    this.logoKey = storageKey;
    this.logoRemoved = false;
  }

  onLogoCleared(): void {
    this.logoKey = null; // explicit null → remove the logo
    this.logoRemoved = true;
  }

  onCoverUploaded(storageKey: string): void {
    this.coverKey = storageKey;
    this.coverRemoved = false;
  }

  onCoverCleared(): void {
    this.coverKey = null;
    this.coverRemoved = true;
  }

  hasChanges(): boolean {
    return JSON.stringify(this.form) !== this.originalForm
      || this.logoKey !== undefined
      || this.coverKey !== undefined;
  }

  canSave(): boolean {
    if (this.saving || this.uploading || !this.hasChanges()) return false;
    if (this.form.description.length > this.descriptionMax) return false;
    return true;
  }

  /** Partial update: only changed fields; explicit null for removed images. */
  save(): void {
    if (!this.canSave() || !this.profile) return;
    const original = JSON.parse(this.originalForm) as typeof this.form;
    const payload: UpdateBusinessProfilePayload = { userId: this.userId };

    if (this.form.tradeName.trim() !== original.tradeName) payload.tradeName = this.form.tradeName.trim();
    if (this.form.description !== original.description) payload.description = this.form.description;
    if (this.form.contactPhone !== original.contactPhone) payload.contactPhone = this.form.contactPhone;
    if (this.form.contactEmail !== original.contactEmail) payload.contactEmail = this.form.contactEmail;
    if (this.form.websiteUrl !== original.websiteUrl) payload.websiteUrl = this.form.websiteUrl;
    if (this.form.addressLine !== original.addressLine) payload.addressLine = this.form.addressLine;

    const social = this.form.socialLinks.filter((l) => l.platform.trim() && l.url.trim());
    if (JSON.stringify(social) !== JSON.stringify(original.socialLinks)) payload.socialLinks = social;

    const hours = this.form.workingHours.map((h) => ({
      day: h.day,
      open: h.closed ? '' : h.open,
      close: h.closed ? '' : h.close,
      closed: h.closed,
    }));
    if (JSON.stringify(hours) !== JSON.stringify(original.workingHours.map((h: WorkingHoursEntry) => ({
      day: h.day,
      open: h.closed ? '' : h.open,
      close: h.closed ? '' : h.close,
      closed: h.closed,
    })))) {
      payload.workingHours = hours;
    }

    if (this.logoKey !== undefined) payload.logoStorageKey = this.logoKey;
    if (this.coverKey !== undefined) payload.coverStorageKey = this.coverKey;

    this.saving = true;
    this.errorMessage = '';
    this.businessService.updatePublicProfile(payload).subscribe({
      next: (response) => {
        this.saving = false;
        if (response.status === 'success') {
          this.editMode = false;
          this.successMessage = this.translationService.t('businessProfile.saveSuccess');
          this.refetch();
        } else {
          this.errorMessage = response.message || this.translationService.t('businessProfile.saveFailed');
        }
      },
      error: (error) => {
        this.saving = false;
        this.handleError(error);
        // After an uncertain error, refetch rather than retry.
        this.refetch();
      },
    });
  }

  private refetch(): void {
    this.businessService.getPublicProfile(this.userId).subscribe({
      next: (response) => this.applyResponse(response),
      error: () => { /* keep showing current data on background refetch failure */ },
    });
  }
}
