import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { PageHeaderComponent } from '../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/common/loading-spinner/loading-spinner.component';
import { SafeImageComponent } from '../../../shared/components/common/safe-image/safe-image.component';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { TranslationService } from '../../../shared/services/translation.service';
import { UsersService, AccountPublicPage } from '../../../shared/services/data/users.service';
import { LookupService, Country } from '../../../shared/services/data/lookup.service';
import { ErrorHandlerService } from '../../../shared/services/api/error-handler.service';
import { priceKind } from '../../../shared/utils/price-display';

/**
 * The user's ACTIVE APPROVED ads (public page payload) — this endpoint does
 * not expose pending/rejected/expired ads; use the admin ads listing for
 * broader inspection.
 *
 * The backend filters ads by country_id, so a real countryID is required —
 * the picker defaults to the UAE.
 */
@Component({
  selector: 'app-user-ads',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    SafeImageComponent,
    MatTableModule,
    MatTooltipModule,
    MatButtonModule,
  ],
  template: `
    <app-page-header
      [title]="translationService.t('userAds.title')"
      [subtitle]="translationService.t('userAds.subtitle')">
    </app-page-header>

    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <a [routerLink]="['/users', userId]"
         class="font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300 transition-colors">
        → {{ translationService.t('userAds.backToProfile') }}
      </a>

      <!-- Country picker -->
      <div class="flex items-center gap-2">
        <label class="text-sm text-[color:var(--color-on-surface-variant)]">
          {{ translationService.t('userAds.country') }}
        </label>
        <select [ngModel]="countryId" (ngModelChange)="onCountryChange($event)" class="form-input !w-auto text-sm">
          @for (country of countries; track country.id) {
            <option [ngValue]="country.id">{{ countryName(country) }}</option>
          }
        </select>
      </div>
    </div>

    <div class="mb-4 rounded-m3-md bg-[color:var(--color-warning-wash)] px-4 py-2.5 text-m3-body-md text-[color:var(--color-warning-wash-text)]">
      {{ translationService.t('userAds.scopeNote') }}
    </div>

    @if (isLoading) {
      <app-loading-spinner />
    } @else if (errorMessage) {
      <div class="modern-card !p-6 text-center">
        <p class="status-pill-error inline-block rounded-xl px-4 py-2 text-sm">{{ errorMessage }}</p>
        <div class="mt-4">
          <button matButton="outlined" (click)="reload()">{{ translationService.t('common.retry') }}</button>
        </div>
      </div>
    } @else if (!page || page.ads.length === 0) {
      <div class="modern-card !p-12 text-center text-[color:var(--color-on-surface-variant)]">
        {{ translationService.t('userAds.empty') }}
      </div>
    } @else {
      <div class="modern-table">
        <div class="overflow-x-auto">
          <table mat-table [dataSource]="page.ads" class="w-full" [ngClass]="{'text-right': translationService.isRTL, 'text-left': !translationService.isRTL}">
            <ng-container matColumnDef="image">
              <th mat-header-cell *matHeaderCellDef>{{ translationService.t('posts.image') }}</th>
              <td mat-cell *matCellDef="let ad">
                <app-safe-image
                  [src]="ad.main_image_url"
                  [alt]="ad.post_title"
                  imgClass="h-12 w-12 rounded-lg object-cover"
                  placeholderClass="h-12 w-12 rounded-lg" />
              </td>
            </ng-container>

            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>{{ translationService.t('posts.title') }}</th>
              <td mat-cell *matCellDef="let ad" class="max-w-xs truncate text-sm font-medium">{{ ad.post_title }}</td>
            </ng-container>

            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef>{{ translationService.t('posts.price') }}</th>
              <td mat-cell *matCellDef="let ad" class="text-sm">
                @if (priceKind(ad.price_type) === 'fixed') {
                  <span class="font-semibold">{{ ad.price | number }} {{ ad.currency || translationService.t('posts.currency') }}</span>
                } @else if (priceKind(ad.price_type) === 'market') {
                  <span class="status-pill status-pill-info">{{ translationService.t('posts.priceMarket') }}</span>
                } @else {
                  <span class="status-pill">{{ translationService.t('posts.priceContact') }}</span>
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>{{ translationService.t('posts.category') }}</th>
              <td mat-cell *matCellDef="let ad" class="text-sm">{{ ad.categoryName || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>{{ translationService.t('common.date') }}</th>
              <td mat-cell *matCellDef="let ad" class="text-sm">{{ ad.create_date | date:'yyyy-MM-dd' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>{{ translationService.t('common.actions') }}</th>
              <td mat-cell *matCellDef="let ad">
                <button
                  mat-icon-button
                  [routerLink]="['/posts-ads', ad.id]"
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
          </table>
        </div>
      </div>
    }
  `,
})
export class UserAdsComponent implements OnInit, OnDestroy {
  page: AccountPublicPage | null = null;
  displayedColumns = ['image', 'title', 'price', 'category', 'date', 'actions'];
  isLoading = false;
  errorMessage = '';
  userId = 0;

  countries: Country[] = [];
  countryId = 0;

  protected readonly priceKind = priceKind;
  private destroy$ = new Subject<void>();

  constructor(
    public translationService: TranslationService,
    public lookup: LookupService,
    private route: ActivatedRoute,
    private usersService: UsersService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    // The backend filters ads by country_id — resolve the country list first
    // so the first load already uses a real country (default: UAE).
    this.lookup.getCountries().subscribe((countries) => {
      this.countries = countries;
      const uae = countries.find((c) => c.code === 'AE');
      this.countryId = uae ? uae.id : (countries[0]?.id ?? 0);
      this.route.paramMap
        .pipe(
          takeUntil(this.destroy$),
          switchMap((params) => {
            this.userId = Number(params.get('id')) || 0;
            this.isLoading = true;
            this.errorMessage = '';
            this.page = null;
            return this.load();
          })
        )
        .subscribe({
          next: (response) => this.handleResponse(response),
          error: (error) => this.handleError(error),
        });
    });
  }

  onCountryChange(countryId: number): void {
    this.countryId = countryId;
    this.reload();
  }

  /** Localized country name based on the active UI language. */
  countryName(country: Country): string {
    return this.translationService.currentLanguageValue === 'ar' ? country.name_ar : country.name_en;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  reload(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.load().subscribe({
      next: (response) => this.handleResponse(response),
      error: (error) => this.handleError(error),
    });
  }

  private load() {
    return this.usersService.getAccountPublicPage(
      this.userId,
      this.translationService.isRTL ? 'ar' : 'en',
      this.countryId
    );
  }

  private handleResponse(response: { status: string; message?: string; data?: AccountPublicPage }): void {
    this.isLoading = false;
    if (response.status === 'success' && response.data) {
      this.page = {
        profile: response.data.profile,
        ads: response.data.ads || [],
      };
    } else {
      this.errorMessage = response.message || this.translationService.t('userAds.loadFailed');
    }
  }

  private handleError(error: HttpErrorResponse): void {
    this.isLoading = false;
    this.errorMessage = this.errorHandler.handleError(error).message;
  }
}
