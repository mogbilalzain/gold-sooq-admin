import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { PageHeaderComponent } from '../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/common/loading-spinner/loading-spinner.component';
import { SafeImageComponent } from '../../../shared/components/common/safe-image/safe-image.component';
import { MatButtonModule } from '@angular/material/button';
import { TranslationService } from '../../../shared/services/translation.service';
import { UsersService, UserPublicProfile } from '../../../shared/services/data/users.service';
import { ErrorHandlerService } from '../../../shared/services/api/error-handler.service';
import { toFlag } from '../../../shared/utils/verification';

/**
 * Public profile of a user as seen by an admin (banned users included).
 * Three render modes: individual, business, and degraded (a business
 * account whose privileged profile could not be loaded — only the
 * individual fields are shown with a notice). KYC notes/documents are
 * never part of this payload.
 */
@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    SafeImageComponent,
    MatButtonModule,
  ],
  template: `
    <app-page-header
      [title]="translationService.t('userProfile.title')"
      [subtitle]="translationService.t('userProfile.subtitle')">
    </app-page-header>

    @if (isLoading) {
      <app-loading-spinner />
    } @else if (errorMessage) {
      <div class="modern-card !p-6 text-center">
        <p class="status-pill-error inline-block rounded-xl px-4 py-2 text-sm">{{ errorMessage }}</p>
        <div class="mt-4">
          <button matButton="outlined" (click)="reload()">{{ translationService.t('common.retry') }}</button>
        </div>
      </div>
    } @else if (profile) {
      @if (degraded) {
        <div class="mb-4 rounded-m3-md bg-[color:var(--color-warning-wash)] px-4 py-3 text-m3-body-md text-[color:var(--color-warning-wash-text)]">
          {{ translationService.t('userProfile.degradedNotice') }}
        </div>
      }

      <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <!-- Identity card -->
        <div class="modern-card !p-6">
          <div class="flex items-center gap-4">
            <app-safe-image
              [src]="profile.logoUrl || profile.avatarUrl"
              [alt]="displayName()"
              imgClass="h-16 w-16 rounded-2xl object-cover"
              placeholderClass="h-16 w-16 rounded-2xl"
              [placeholderText]="initials()" />
            <div>
              <h2 class="text-m3-title-lg font-semibold text-[color:var(--color-on-surface)]">{{ displayName() }}</h2>
              <p class="text-sm text-[color:var(--color-on-surface-variant)]">
                {{ isBusiness() ? translationService.t('users.accountBusiness') : translationService.t('users.accountIndividual') }}
              </p>
              <div class="mt-1 flex flex-wrap gap-2">
                @if (identityVerified()) {
                  <span class="status-pill status-pill-success">{{ translationService.t('posts.identityVerified') }}</span>
                }
                @if (businessVerified()) {
                  <span class="status-pill status-pill-info">{{ translationService.t('posts.businessVerified') }}</span>
                }
              </div>
            </div>
          </div>

          <dl class="mt-6 space-y-3 text-sm">
            <div class="flex justify-between gap-4">
              <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('users.phoneNumber') }}</dt>
              <dd class="font-medium" dir="ltr">{{ profile.phoneNumber || '-' }}</dd>
            </div>
            @if (profile.email) {
              <div class="flex justify-between gap-4">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('users.email') }}</dt>
                <dd class="font-medium">{{ profile.email }}</dd>
              </div>
            }
            @if (isBusiness() && profile.ownerName) {
              <div class="flex justify-between gap-4">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('userProfile.ownerName') }}</dt>
                <dd class="font-medium">{{ profile.ownerName }}</dd>
              </div>
            }
            <div class="flex justify-between gap-4">
              <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('users.identityStatus') }}</dt>
              <dd>
                <span class="status-pill"
                      [class.status-pill-success]="identityVerified()"
                      [class.status-pill-warning]="!identityVerified()">
                  {{ translationService.t('identity.status.' + (profile.identityStatus || 'unverified')) }}
                </span>
              </dd>
            </div>
            @if (profile.identityExpiresOn) {
              <div class="flex justify-between gap-4">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('userProfile.identityExpiresOn') }}</dt>
                <dd class="font-medium">{{ profile.identityExpiresOn | date:'yyyy-MM-dd' }}</dd>
              </div>
            }
            @if (banned()) {
              <div class="flex justify-between gap-4">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('userProfile.accountState') }}</dt>
                <dd><span class="status-pill status-pill-error">{{ translationService.t('userProfile.banned') }}</span></dd>
              </div>
            }
          </dl>

          <div class="mt-6 flex flex-col gap-2 border-t border-outline-variant/40 pt-4">
            <a [routerLink]="['/users', userId, 'ads']"
               class="font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300 transition-colors">
              {{ translationService.t('userProfile.viewActiveAds') }} ←
            </a>
            @if (isBusiness() && !degraded) {
              <a [routerLink]="['/business-profiles', userId]"
                 class="font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300 transition-colors">
                {{ translationService.t('userProfile.viewBusinessProfile') }} ←
              </a>
            }
          </div>
        </div>

        <!-- Business details -->
        @if (isBusiness() && !degraded) {
          <div class="modern-card !p-6 xl:col-span-2">
            @if (profile.coverUrl) {
              <app-safe-image
                [src]="profile.coverUrl"
                [alt]="displayName()"
                imgClass="mb-5 h-40 w-full rounded-2xl object-cover"
                placeholderClass="mb-5 h-40 w-full rounded-2xl" />
            }
            <h3 class="mb-4 text-m3-title-md font-semibold text-[color:var(--color-on-surface)]">{{ translationService.t('userProfile.businessInfo') }}</h3>
            <dl class="grid grid-cols-1 gap-x-8 gap-y-3 text-sm md:grid-cols-2">
              <div class="flex justify-between gap-4">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('userProfile.tradeName') }}</dt>
                <dd class="font-medium">{{ profile.tradeName || '-' }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('userProfile.businessKind') }}</dt>
                <dd class="font-medium">{{ profile.businessKind ? translationService.t('business.kind.' + profile.businessKind) : '-' }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('userProfile.activityType') }}</dt>
                <dd class="font-medium">{{ profile.activityType ? translationService.t('business.activity.' + profile.activityType) : '-' }}</dd>
              </div>
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
              <div class="flex justify-between gap-4 md:col-span-2">
                <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('userProfile.address') }}</dt>
                <dd class="font-medium">{{ profile.addressLine || '-' }}</dd>
              </div>
              @if (profile.description) {
                <div class="md:col-span-2">
                  <dt class="text-[color:var(--color-on-surface-variant)]">{{ translationService.t('userProfile.description') }}</dt>
                  <dd class="mt-1 whitespace-pre-wrap font-medium">{{ profile.description }}</dd>
                </div>
              }
            </dl>

            @if (profile.socialLinks && profile.socialLinks.length) {
              <h4 class="mb-2 mt-6 text-m3-title-sm font-semibold text-[color:var(--color-on-surface)]">{{ translationService.t('userProfile.socialLinks') }}</h4>
              <ul class="space-y-1 text-sm">
                @for (link of profile.socialLinks; track link.platform + link.url) {
                  <li>
                    <span class="font-medium">{{ link.platform }}:</span>
                    <a [href]="link.url" target="_blank" rel="noopener" class="text-brand-700 dark:text-brand-400">{{ link.url }}</a>
                  </li>
                }
              </ul>
            }

            @if (profile.workingHours && profile.workingHours.length) {
              <h4 class="mb-2 mt-6 text-m3-title-sm font-semibold text-[color:var(--color-on-surface)]">{{ translationService.t('userProfile.workingHours') }}</h4>
              <ul class="space-y-1 text-sm">
                @for (hours of profile.workingHours; track hours.day) {
                  <li class="flex justify-between gap-4">
                    <span>{{ translationService.t('business.days.' + hours.day) }}</span>
                    <span class="font-medium" dir="ltr">
                      {{ hours.closed ? translationService.t('business.closed') : (hours.open + ' - ' + hours.close) }}
                    </span>
                  </li>
                }
              </ul>
            }
          </div>
        }
      </div>
    }
  `,
})
export class UserProfileComponent implements OnInit, OnDestroy {
  profile: UserPublicProfile | null = null;
  isLoading = false;
  errorMessage = '';
  degraded = false;
  userId = 0;

  private destroy$ = new Subject<void>();

  constructor(
    public translationService: TranslationService,
    private route: ActivatedRoute,
    private usersService: UsersService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          this.userId = Number(params.get('id')) || 0;
          this.isLoading = true;
          this.errorMessage = '';
          this.profile = null;
          this.degraded = false;
          return this.usersService.getPublicProfile(this.userId, this.langCode());
        })
      )
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.status === 'success' && response.data) {
            this.profile = response.data;
            // Degraded: a business account whose privileged profile is absent.
            this.degraded = this.profile.sellerType === 'business' && !this.profile.tradeName && !this.profile.businessKind;
          } else {
            this.errorMessage = response.message || this.translationService.t('userProfile.loadFailed');
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

  reload(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.usersService.getPublicProfile(this.userId, this.langCode()).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 'success' && response.data) {
          this.profile = response.data;
          this.degraded = this.profile.sellerType === 'business' && !this.profile.tradeName && !this.profile.businessKind;
        } else {
          this.errorMessage = response.message || this.translationService.t('userProfile.loadFailed');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.errorHandler.handleError(error).message;
      },
    });
  }

  langCode(): 'en' | 'ar' {
    return this.translationService.isRTL ? 'ar' : 'en';
  }

  isBusiness(): boolean {
    return this.profile?.sellerType === 'business' || this.profile?.accountType === 'business';
  }

  identityVerified(): boolean {
    return toFlag(this.profile?.isIdentityVerified) || this.profile?.identityStatus === 'verified';
  }

  businessVerified(): boolean {
    return toFlag(this.profile?.isBusinessVerified);
  }

  banned(): boolean {
    return toFlag(this.profile?.banned) || this.profile?.status === 'banned';
  }

  displayName(): string {
    return this.profile?.displayName || this.profile?.tradeName || this.profile?.ownerName || `#${this.userId}`;
  }

  initials(): string {
    const name = this.displayName().trim();
    return name ? name.charAt(0).toUpperCase() : '?';
  }
}
