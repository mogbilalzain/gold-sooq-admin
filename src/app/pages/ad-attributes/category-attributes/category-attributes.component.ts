import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslationService } from '../../../shared/services/translation.service';
import { ErrorHandlerService } from '../../../shared/services/api/error-handler.service';
import {
  AdAttribute,
  AdAttributesService,
  CategoryAttributeMapping,
  AssignCategoryAttributeRequest,
} from '../../../shared/services/data/ad-attributes.service';
import { CategoriesService, Category } from '../../../shared/services/data/categories.service';
import { ConfirmDialogComponent } from '../../../shared/components/common/confirm-dialog/confirm-dialog.component';
import { API_ERROR_CODE_KEYS, extractApiErrorCode } from '../../../shared/utils/api-error-codes';
import { toFlag } from '../../../shared/utils/verification';

/**
 * Category-attribute mappings tab (subcategories only).
 * - Text attributes cannot be filterable (client-enforced + backend-enforced).
 * - A dependent attribute requires its parent assigned first
 *   (PARENT_ATTRIBUTE_NOT_ASSIGNED); unassigning a parent with dependents
 *   fails with ATTRIBUTE_HAS_DEPENDENTS.
 * - is_required defaults to false: enabling it depends on a Flutter release
 *   that sends attributes — the UI shows that warning.
 */
@Component({
  selector: 'app-category-attributes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ConfirmDialogComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatTableModule,
    MatTooltipModule,
  ],
  template: `
    <div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
      <mat-form-field class="w-full" subscriptSizing="dynamic">
        <mat-label>{{ translationService.t('mappings.selectSubcategory') }}</mat-label>
        <mat-select
          [value]="selectedCategoryId ?? ''"
          (selectionChange)="onCategoryChange($event.value)"
        >
          <mat-option value="" disabled>{{ translationService.t('mappings.chooseSubcategory') }}</mat-option>
          @for (sub of subcategories; track sub.id) {
            <mat-option [value]="sub.id">{{ subcategoryLabel(sub) }}</mat-option>
          }
        </mat-select>
        <mat-hint>{{ translationService.t('mappings.subcategoriesOnly') }}</mat-hint>
      </mat-form-field>
    </div>

    @if (errorMessage) {
      <div class="mb-4 rounded-xl border border-error-200 bg-error-50 p-3 text-sm text-error-600 dark:border-error-800 dark:bg-error-900/20 dark:text-error-400">
        {{ errorMessage }}
      </div>
    }

    @if (selectedCategoryId) {
      <!-- Assign form -->
      <form
        [formGroup]="assignForm"
        (ngSubmit)="submitAssign()"
        class="mb-6 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 dark:border-outline-variant/20 dark:bg-surface-container-low"
      >
        <h3 class="mb-4 text-m3-title-md font-semibold text-surface-on-surface">
          {{ translationService.t('mappings.assignTitle') }}
        </h3>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <mat-form-field class="w-full lg:col-span-2" subscriptSizing="dynamic">
            <mat-label>{{ translationService.t('mappings.attribute') }}</mat-label>
            <mat-select formControlName="attributeId">
              <mat-option [value]="null" disabled>{{ translationService.t('mappings.chooseAttribute') }}</mat-option>
              @for (attr of assignableAttributes; track attr.id) {
                <mat-option [value]="attr.id">{{ attr.name_ar }} / {{ attr.name_en }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field class="w-full" subscriptSizing="dynamic">
            <mat-label>{{ translationService.t('mappings.sortOrder') }}</mat-label>
            <input matInput formControlName="sort_order" type="number" dir="ltr" />
          </mat-form-field>
        </div>

        <div class="mt-4 flex flex-wrap gap-6">
          <mat-checkbox formControlName="is_required">
            {{ translationService.t('mappings.isRequired') }}
          </mat-checkbox>
          <mat-checkbox formControlName="is_filterable" [disabled]="selectedAttributeIsText">
            {{ translationService.t('mappings.isFilterable') }}
          </mat-checkbox>
          <mat-checkbox formControlName="show_in_card">
            {{ translationService.t('mappings.showInCard') }}
          </mat-checkbox>
        </div>

        @if (selectedAttributeIsText) {
          <p class="mt-2 text-xs text-surface-on-surface-variant">
            {{ translationService.t('mappings.textNotFilterable') }}
          </p>
        }
        @if (selectedAttributeIsDependent && !parentAlreadyAssigned) {
          <p class="mt-2 text-xs text-warning-600 dark:text-warning-400">
            {{ translationService.t('mappings.parentNotAssignedWarning') }}
          </p>
        }
        @if (assignForm.value.is_required) {
          <p class="mt-2 text-xs text-warning-600 dark:text-warning-400">
            {{ translationService.t('mappings.requiredWarning') }}
          </p>
        }

        @if (assignError) {
          <p class="mt-3 text-sm text-error-600 dark:text-error-500">{{ assignError }}</p>
        }

        <div class="mt-4">
          <button type="submit" matButton="filled" [disabled]="assignForm.invalid || submitting"
                  class="px-6">
            {{ translationService.t(submitting ? 'common.saving' : 'mappings.assign') }}
          </button>
        </div>
      </form>

      <!-- Assigned list -->
      <div class="overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest dark:border-outline-variant/20 dark:bg-surface-container-low">
        @if (loadingMappings) {
          <div class="animate-pulse space-y-3 p-6">
            @for (i of [1, 2, 3]; track i) {
              <div class="h-4 w-full rounded bg-surface-container-high"></div>
            }
          </div>
        } @else if (!mappings.length) {
          <p class="p-10 text-center text-sm text-surface-on-surface-variant">
            {{ translationService.t('mappings.empty') }}
          </p>
        } @else {
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="mappings" class="w-full min-w-[720px] text-sm">
              <ng-container matColumnDef="attribute">
                <th mat-header-cell *matHeaderCellDef class="!p-3 text-start text-xs font-semibold text-surface-on-surface-variant">{{ translationService.t('mappings.attribute') }}</th>
                <td mat-cell *matCellDef="let mapping" class="!p-3">
                  <p class="font-semibold text-surface-on-surface">{{ attributeLabel(mapping) }}</p>
                  <p class="text-xs text-surface-on-surface-variant" dir="ltr">{{ attributeOf(mapping)?.code }}</p>
                </td>
              </ng-container>

              @for (field of togglableFields; track field.key) {
                <ng-container [matColumnDef]="field.key">
                  <th mat-header-cell *matHeaderCellDef class="!p-3 text-start text-xs font-semibold text-surface-on-surface-variant">{{ translationService.t(field.labelKey) }}</th>
                  <td mat-cell *matCellDef="let mapping" class="!p-3">
                    <mat-checkbox
                      [checked]="mappingFlag(mapping, field.key)"
                      [disabled]="submitting || (field.key === 'is_filterable' && attributeOf(mapping)?.data_type === 'text')"
                      (change)="toggleMapping(mapping, field.key, $event.checked)"
                      [attr.aria-label]="translationService.t(field.labelKey)"
                    />
                  </td>
                </ng-container>
              }

              <ng-container matColumnDef="sortOrder">
                <th mat-header-cell *matHeaderCellDef class="!p-3 text-start text-xs font-semibold text-surface-on-surface-variant">{{ translationService.t('mappings.sortOrder') }}</th>
                <td mat-cell *matCellDef="let mapping" class="!p-3 text-surface-on-surface-variant" dir="ltr">{{ mapping.sort_order ?? 0 }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="!p-3 text-start text-xs font-semibold text-surface-on-surface-variant">{{ translationService.t('common.actions') }}</th>
                <td mat-cell *matCellDef="let mapping" class="!p-3">
                  <button type="button" mat-icon-button (click)="askUnassign(mapping)"
                          [matTooltip]="translationService.t('mappings.unassign')"
                          [attr.aria-label]="translationService.t('mappings.unassign')"
                          class="!text-[color:var(--color-error)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                    </svg>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
          <p class="border-t border-outline-variant/20 p-3 text-xs text-surface-on-surface-variant">
            {{ translationService.t('mappings.unassignNote') }}
          </p>
        }
      </div>
    }

    <app-confirm-dialog
      [open]="!!pendingUnassign"
      [title]="translationService.t('mappings.unassignTitle')"
      [message]="translationService.t('mappings.unassignMessage')"
      [confirmLabel]="translationService.t('mappings.unassign')"
      variant="destructive"
      (confirmed)="confirmUnassign()"
      (cancelled)="pendingUnassign = null"
    ></app-confirm-dialog>
  `,
})
export class CategoryAttributesComponent implements OnInit {
  @Input() attributes: AdAttribute[] = [];
  @Input() loading = false;

  readonly translationService = inject(TranslationService);
  private readonly fb = inject(FormBuilder);
  private readonly adAttributesService = inject(AdAttributesService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly errorHandler = inject(ErrorHandlerService);

  subcategories: Category[] = [];
  private parentNameById = new Map<number, string>();

  selectedCategoryId: number | null = null;
  mappings: CategoryAttributeMapping[] = [];
  loadingMappings = false;
  submitting = false;
  errorMessage = '';
  assignError = '';
  pendingUnassign: CategoryAttributeMapping | null = null;

  readonly togglableFields: { key: 'is_required' | 'is_filterable' | 'show_in_card'; labelKey: string }[] = [
    { key: 'is_required', labelKey: 'mappings.isRequired' },
    { key: 'is_filterable', labelKey: 'mappings.isFilterable' },
    { key: 'show_in_card', labelKey: 'mappings.showInCard' },
  ];

  readonly displayedColumns = ['attribute', 'is_required', 'is_filterable', 'show_in_card', 'sortOrder', 'actions'];

  assignForm: FormGroup = this.fb.group({
    attributeId: [null as number | null, Validators.required],
    is_required: [false],
    is_filterable: [true],
    show_in_card: [true],
    sort_order: [0],
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    const langCode = this.translationService.currentLanguageValue;
    this.categoriesService.listCategories({ page: 1, limit: 100, langCode }).subscribe({
      next: (response) => {
        if (response.status !== 'success' || !response.data) return;
        const subs: Category[] = [];
        for (const top of response.data.categories) {
          const parentName = this.categoryName(top);
          for (const sub of top.subCategories ?? []) {
            this.parentNameById.set(sub.id, parentName);
            subs.push(sub);
          }
        }
        this.subcategories = subs;
      },
      error: (error) => {
        this.errorMessage = this.errorHandler.getErrorMessage(error);
      },
    });
  }

  categoryName(category: Category): string {
    return this.translationService.currentLanguageValue === 'ar'
      ? category.name_ar
      : category.name_en;
  }

  subcategoryLabel(sub: Category): string {
    const parentName = this.parentNameById.get(sub.id);
    return parentName ? `${parentName} › ${this.categoryName(sub)}` : this.categoryName(sub);
  }

  onCategoryChange(value: number | string): void {
    this.selectedCategoryId = value ? Number(value) : null;
    this.assignError = '';
    this.loadMappings();
  }

  loadMappings(): void {
    if (!this.selectedCategoryId) {
      this.mappings = [];
      return;
    }
    this.loadingMappings = true;
    this.errorMessage = '';
    this.adAttributesService.listCategoryAttributes(this.selectedCategoryId).subscribe({
      next: (mappings) => {
        this.mappings = mappings;
        this.loadingMappings = false;
      },
      error: (error) => {
        this.errorMessage = this.errorHandler.getErrorMessage(error);
        this.loadingMappings = false;
      },
    });
  }

  get activeAttributes(): AdAttribute[] {
    return this.attributes.filter((a) => toFlag(a.is_active ?? true));
  }

  get assignableAttributes(): AdAttribute[] {
    const assignedIds = new Set(this.mappings.map((m) => m.attributeId));
    return this.activeAttributes.filter((a) => !assignedIds.has(a.id));
  }

  get selectedAssignAttribute(): AdAttribute | null {
    const id = this.assignForm.value.attributeId;
    return this.attributes.find((a) => a.id === id) ?? null;
  }

  get selectedAttributeIsText(): boolean {
    return this.selectedAssignAttribute?.data_type === 'text';
  }

  get selectedAttributeIsDependent(): boolean {
    return !!this.selectedAssignAttribute?.depends_on_attribute_id;
  }

  get parentAlreadyAssigned(): boolean {
    const parentId = this.selectedAssignAttribute?.depends_on_attribute_id;
    if (!parentId) return false;
    return this.mappings.some((m) => m.attributeId === parentId);
  }

  attributeOf(mapping: CategoryAttributeMapping): AdAttribute | null {
    return mapping.attribute ?? this.attributes.find((a) => a.id === mapping.attributeId) ?? null;
  }

  attributeLabel(mapping: CategoryAttributeMapping): string {
    const attr = this.attributeOf(mapping);
    return attr ? `${attr.name_ar} / ${attr.name_en}` : `#${mapping.attributeId}`;
  }

  mappingFlag(mapping: CategoryAttributeMapping, key: 'is_required' | 'is_filterable' | 'show_in_card'): boolean {
    return toFlag(mapping[key] ?? false);
  }

  submitAssign(): void {
    if (this.assignForm.invalid || this.submitting || !this.selectedCategoryId) return;
    this.submitting = true;
    this.assignError = '';
    const v = this.assignForm.getRawValue();
    const payload: AssignCategoryAttributeRequest = {
      categoryId: this.selectedCategoryId,
      attributeId: v.attributeId,
      is_required: !!v.is_required,
      // Text attributes cannot be filterable (also enforced server-side).
      is_filterable: this.selectedAttributeIsText ? false : !!v.is_filterable,
      show_in_card: !!v.show_in_card,
      sort_order: Number(v.sort_order ?? 0),
    };
    this.adAttributesService.assignCategoryAttribute(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.assignForm.reset({ attributeId: null, is_required: false, is_filterable: true, show_in_card: true, sort_order: 0 });
        this.loadMappings();
      },
      error: (error) => {
        this.submitting = false;
        this.assignError = this.describeError(error);
      },
    });
  }

  toggleMapping(
    mapping: CategoryAttributeMapping,
    key: 'is_required' | 'is_filterable' | 'show_in_card',
    checked: boolean
  ): void {
    if (this.submitting || !this.selectedCategoryId) return;
    this.submitting = true;
    this.adAttributesService
      .updateCategoryAttribute({
        categoryId: this.selectedCategoryId,
        attributeId: mapping.attributeId,
        [key]: checked,
      })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.loadMappings();
        },
        error: (error) => {
          this.submitting = false;
          this.errorMessage = this.describeError(error);
          // Refresh to restore the authoritative state.
          this.loadMappings();
        },
      });
  }

  askUnassign(mapping: CategoryAttributeMapping): void {
    this.pendingUnassign = mapping;
  }

  confirmUnassign(): void {
    const mapping = this.pendingUnassign;
    this.pendingUnassign = null;
    if (!mapping || this.submitting || !this.selectedCategoryId) return;
    this.submitting = true;
    this.adAttributesService
      .unassignCategoryAttribute(this.selectedCategoryId, mapping.attributeId)
      .subscribe({
        next: () => {
          this.submitting = false;
          this.loadMappings();
        },
        error: (error) => {
          this.submitting = false;
          this.errorMessage = this.describeError(error);
        },
      });
  }

  private describeError(error: unknown): string {
    const code = extractApiErrorCode(error);
    return code && API_ERROR_CODE_KEYS[code]
      ? this.translationService.t(API_ERROR_CODE_KEYS[code])
      : this.errorHandler.getErrorMessage(error as never);
  }
}
