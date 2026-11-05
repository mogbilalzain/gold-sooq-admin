import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslationService } from '../../../shared/services/translation.service';
import { ErrorHandlerService } from '../../../shared/services/api/error-handler.service';
import {
  AdAttribute,
  AdAttributesService,
  AttributeDataType,
  CreateAttributeRequest,
  UpdateAttributeRequest,
} from '../../../shared/services/data/ad-attributes.service';
import { ConfirmDialogComponent } from '../../../shared/components/common/confirm-dialog/confirm-dialog.component';
import { API_ERROR_CODE_KEYS, extractApiErrorCode } from '../../../shared/utils/api-error-codes';
import { toFlag } from '../../../shared/utils/verification';

const DATA_TYPES: AttributeDataType[] = ['select', 'number', 'text', 'boolean'];

/**
 * Attribute definitions tab: list, create, partial update,
 * deactivate/reactivate (never hard delete).
 * - code is immutable after creation (Postman contract).
 * - data_type / depends_on_attribute_id are set at creation only; changing
 *   them later can fail with ATTRIBUTE_HAS_VALUES, so the edit form hides them.
 */
@Component({
  selector: 'app-attribute-definitions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ConfirmDialogComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatTooltipModule,
  ],
  template: `
    <!-- Header + add button -->
    <div class="mb-4 flex items-center justify-between">
      <p class="text-sm text-surface-on-surface-variant">
        {{ translationService.t('attributes.definitionsHint') }}
      </p>
      <button
        type="button"
        matButton="filled"
        (click)="openCreateForm()"
        class="px-6"
      >
        {{ translationService.t('attributes.addAttribute') }}
      </button>
    </div>

    <!-- Create / edit form -->
    @if (formVisible) {
      <form
        [formGroup]="form"
        (ngSubmit)="submitForm()"
        class="mb-6 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 dark:border-outline-variant/20 dark:bg-surface-container-low"
      >
        <h3 class="mb-4 text-m3-title-md font-semibold text-surface-on-surface">
          {{ translationService.t(editing ? 'attributes.editAttribute' : 'attributes.addAttribute') }}
        </h3>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <mat-form-field class="w-full" subscriptSizing="dynamic">
            <mat-label>{{ translationService.t('attributes.code') }}</mat-label>
            <input
              matInput
              formControlName="code"
              [readonly]="!!editing"
              dir="ltr"
            />
            @if (editing) {
              <mat-hint>{{ translationService.t('attributes.codeImmutable') }}</mat-hint>
            }
          </mat-form-field>
          <mat-form-field class="w-full" subscriptSizing="dynamic">
            <mat-label>{{ translationService.t('attributes.dataType') }}</mat-label>
            <mat-select formControlName="data_type" [disabled]="!!editing">
              @for (dt of dataTypes; track dt) {
                <mat-option [value]="dt">{{ translationService.t('attributes.dataTypes.' + dt) }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field class="w-full" subscriptSizing="dynamic">
            <mat-label>{{ translationService.t('attributes.nameAr') }}</mat-label>
            <input matInput formControlName="name_ar" />
          </mat-form-field>
          <mat-form-field class="w-full" subscriptSizing="dynamic">
            <mat-label>{{ translationService.t('attributes.nameEn') }}</mat-label>
            <input matInput formControlName="name_en" dir="ltr" />
          </mat-form-field>
        </div>

        <!-- Number-only fields -->
        @if (form.value.data_type === 'number') {
          <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <mat-form-field class="w-full" subscriptSizing="dynamic">
              <mat-label>{{ translationService.t('attributes.unitAr') }}</mat-label>
              <input matInput formControlName="unit_ar" />
            </mat-form-field>
            <mat-form-field class="w-full" subscriptSizing="dynamic">
              <mat-label>{{ translationService.t('attributes.unitEn') }}</mat-label>
              <input matInput formControlName="unit_en" dir="ltr" />
            </mat-form-field>
            <mat-form-field class="w-full" subscriptSizing="dynamic">
              <mat-label>{{ translationService.t('attributes.minValue') }}</mat-label>
              <input matInput formControlName="min_value" type="number" step="any" dir="ltr" />
            </mat-form-field>
            <mat-form-field class="w-full" subscriptSizing="dynamic">
              <mat-label>{{ translationService.t('attributes.maxValue') }}</mat-label>
              <input matInput formControlName="max_value" type="number" step="any" dir="ltr" />
            </mat-form-field>
            <mat-form-field class="w-full" subscriptSizing="dynamic">
              <mat-label>{{ translationService.t('attributes.decimalPlaces') }}</mat-label>
              <input matInput formControlName="decimal_places" type="number" min="0" max="6" dir="ltr" />
            </mat-form-field>
          </div>
          @if (numericRangeInvalid) {
            <p class="mt-2 text-xs text-error-600 dark:text-error-500">
              {{ translationService.t('attributes.minMaxInvalid') }}
            </p>
          }
        }

        <!-- Dependent select -->
        @if (form.value.data_type === 'select' && !editing) {
          <div class="mt-4 md:max-w-sm">
            <mat-form-field class="w-full" subscriptSizing="dynamic">
              <mat-label>{{ translationService.t('attributes.dependsOn') }}</mat-label>
              <mat-select formControlName="depends_on_attribute_id">
                <mat-option [value]="null">{{ translationService.t('attributes.noDependency') }}</mat-option>
                @for (parent of selectableParents; track parent.id) {
                  <mat-option [value]="parent.id">{{ parent.name_ar }} / {{ parent.name_en }}</mat-option>
                }
              </mat-select>
              <mat-hint>{{ translationService.t('attributes.dependsOnHint') }}</mat-hint>
            </mat-form-field>
          </div>
        }

        @if (formError) {
          <p class="mt-3 text-sm text-error-600 dark:text-error-500">{{ formError }}</p>
        }

        <div class="mt-5 flex items-center gap-3">
          <button
            type="submit"
            matButton="filled"
            [disabled]="form.invalid || submitting || numericRangeInvalid"
            class="px-6"
          >
            {{ translationService.t(submitting ? 'common.saving' : 'common.save') }}
          </button>
          <button
            type="button"
            matButton="outlined"
            (click)="closeForm()"
          >
            {{ translationService.t('common.cancel') }}
          </button>
        </div>
      </form>
    }

    <!-- Table -->
    <div class="overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest dark:border-outline-variant/20 dark:bg-surface-container-low">
      @if (loading) {
        <div class="animate-pulse space-y-3 p-6">
          @for (i of [1, 2, 3]; track i) {
            <div class="h-4 w-full rounded bg-surface-container-high"></div>
          }
        </div>
      } @else if (!attributes.length) {
        <p class="p-10 text-center text-sm text-surface-on-surface-variant">
          {{ translationService.t('attributes.empty') }}
        </p>
      } @else {
        <div class="overflow-x-auto">
          <table mat-table [dataSource]="attributes" class="w-full min-w-[720px] text-sm">
            <ng-container matColumnDef="code">
              <th mat-header-cell *matHeaderCellDef class="!p-3 text-start text-xs font-semibold text-surface-on-surface-variant">{{ translationService.t('attributes.code') }}</th>
              <td mat-cell *matCellDef="let attr" class="!p-3 font-mono text-xs text-surface-on-surface" dir="ltr">{{ attr.code }}</td>
            </ng-container>

            <ng-container matColumnDef="nameAr">
              <th mat-header-cell *matHeaderCellDef class="!p-3 text-start text-xs font-semibold text-surface-on-surface-variant">{{ translationService.t('attributes.nameAr') }}</th>
              <td mat-cell *matCellDef="let attr" class="!p-3 text-surface-on-surface">{{ attr.name_ar }}</td>
            </ng-container>

            <ng-container matColumnDef="nameEn">
              <th mat-header-cell *matHeaderCellDef class="!p-3 text-start text-xs font-semibold text-surface-on-surface-variant">{{ translationService.t('attributes.nameEn') }}</th>
              <td mat-cell *matCellDef="let attr" class="!p-3 text-surface-on-surface" dir="ltr">{{ attr.name_en }}</td>
            </ng-container>

            <ng-container matColumnDef="dataType">
              <th mat-header-cell *matHeaderCellDef class="!p-3 text-start text-xs font-semibold text-surface-on-surface-variant">{{ translationService.t('attributes.dataType') }}</th>
              <td mat-cell *matCellDef="let attr" class="!p-3">
                <span class="rounded-full bg-surface-container-high px-2.5 py-1 text-xs font-medium text-surface-on-surface-variant">
                  {{ translationService.t('attributes.dataTypes.' + attr.data_type) }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="unit">
              <th mat-header-cell *matHeaderCellDef class="!p-3 text-start text-xs font-semibold text-surface-on-surface-variant">{{ translationService.t('attributes.unit') }}</th>
              <td mat-cell *matCellDef="let attr" class="!p-3 text-surface-on-surface-variant">{{ unitLabel(attr) }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef class="!p-3 text-start text-xs font-semibold text-surface-on-surface-variant">{{ translationService.t('common.status') }}</th>
              <td mat-cell *matCellDef="let attr" class="!p-3">
                <span class="rounded-full px-2.5 py-1 text-xs font-semibold" [ngClass]="statusBadgeClass(attr)">
                  {{ translationService.t(isActive(attr) ? 'common.active' : 'common.inactive') }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="!p-3 text-start text-xs font-semibold text-surface-on-surface-variant">{{ translationService.t('common.actions') }}</th>
              <td mat-cell *matCellDef="let attr" class="!p-3">
                <div class="flex items-center gap-1">
                  <button type="button" mat-icon-button (click)="openEditForm(attr)"
                          [matTooltip]="translationService.t('common.edit')"
                          [attr.aria-label]="translationService.t('common.edit')"
                          class="!text-brand-600 dark:!text-brand-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    </svg>
                  </button>
                  @if (isActive(attr)) {
                    <button type="button" mat-icon-button (click)="askDeactivate(attr)"
                            [matTooltip]="translationService.t('attributes.deactivate')"
                            [attr.aria-label]="translationService.t('attributes.deactivate')"
                            class="!text-[color:var(--color-error)]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>
                      </svg>
                    </button>
                  } @else {
                    <button type="button" mat-icon-button (click)="reactivate(attr)" [disabled]="submitting"
                            [matTooltip]="translationService.t('attributes.reactivate')"
                            [attr.aria-label]="translationService.t('attributes.reactivate')"
                            class="!text-success-600 dark:!text-success-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
                      </svg>
                    </button>
                  }
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>
      }
    </div>

    <app-confirm-dialog
      [open]="!!pendingDeactivate"
      [title]="translationService.t('attributes.deactivateTitle')"
      [message]="translationService.t('attributes.deactivateMessage')"
      [confirmLabel]="translationService.t('attributes.deactivate')"
      (confirmed)="confirmDeactivate()"
      (cancelled)="pendingDeactivate = null"
    ></app-confirm-dialog>
  `,
})
export class AttributeDefinitionsComponent {
  @Input() attributes: AdAttribute[] = [];
  @Input() loading = false;
  @Output() changed = new EventEmitter<void>();

  readonly translationService = inject(TranslationService);
  private readonly fb = inject(FormBuilder);
  private readonly adAttributesService = inject(AdAttributesService);
  private readonly errorHandler = inject(ErrorHandlerService);

  readonly dataTypes = DATA_TYPES;
  readonly displayedColumns = ['code', 'nameAr', 'nameEn', 'dataType', 'unit', 'status', 'actions'];

  formVisible = false;
  editing: AdAttribute | null = null;
  submitting = false;
  formError = '';
  pendingDeactivate: AdAttribute | null = null;

  form: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^[a-z0-9_]+$/)]],
    name_ar: ['', Validators.required],
    name_en: ['', Validators.required],
    data_type: ['select' as AttributeDataType, Validators.required],
    unit_ar: [''],
    unit_en: [''],
    min_value: [null as number | null],
    max_value: [null as number | null],
    decimal_places: [null as number | null],
    depends_on_attribute_id: [null as number | null],
  });

  get selectableParents(): AdAttribute[] {
    return this.attributes.filter(
      (a) => a.data_type === 'select' && this.isActive(a) && a.id !== this.editing?.id
    );
  }

  get numericRangeInvalid(): boolean {
    const { min_value, max_value } = this.form.value;
    return (
      this.form.value.data_type === 'number' &&
      min_value !== null && min_value !== undefined &&
      max_value !== null && max_value !== undefined &&
      Number(min_value) > Number(max_value)
    );
  }

  isActive(attr: AdAttribute): boolean {
    return toFlag(attr.is_active ?? true);
  }

  statusBadgeClass(attr: AdAttribute): string {
    return this.isActive(attr)
      ? 'bg-success-50 text-success-600 dark:bg-success-500/15'
      : 'bg-surface-container-high text-surface-on-surface-variant';
  }

  unitLabel(attr: AdAttribute): string {
    if (attr.data_type !== 'number') return '—';
    const ar = attr.unit_ar ?? '';
    const en = attr.unit_en ?? '';
    if (!ar && !en) return '—';
    return `${ar} / ${en}`;
  }

  openCreateForm(): void {
    this.editing = null;
    this.formError = '';
    this.form.reset({
      code: '',
      name_ar: '',
      name_en: '',
      data_type: 'select',
      unit_ar: '',
      unit_en: '',
      min_value: null,
      max_value: null,
      decimal_places: null,
      depends_on_attribute_id: null,
    });
    this.form.get('code')?.enable();
    this.formVisible = true;
  }

  openEditForm(attr: AdAttribute): void {
    this.editing = attr;
    this.formError = '';
    this.form.reset({
      code: attr.code,
      name_ar: attr.name_ar,
      name_en: attr.name_en,
      data_type: attr.data_type,
      unit_ar: attr.unit_ar ?? '',
      unit_en: attr.unit_en ?? '',
      min_value: attr.min_value ?? null,
      max_value: attr.max_value ?? null,
      decimal_places: attr.decimal_places ?? null,
      depends_on_attribute_id: attr.depends_on_attribute_id ?? null,
    });
    this.form.get('code')?.disable();
    this.formVisible = true;
  }

  closeForm(): void {
    this.formVisible = false;
    this.editing = null;
    this.formError = '';
  }

  submitForm(): void {
    if (this.form.invalid || this.submitting) return;
    this.submitting = true;
    this.formError = '';
    const v = this.form.getRawValue();

    if (this.editing) {
      // Partial update: only changed fields; code/data_type are never sent.
      const payload: UpdateAttributeRequest = { attributeId: this.editing.id };
      if (v.name_ar !== this.editing.name_ar) payload.name_ar = v.name_ar;
      if (v.name_en !== this.editing.name_en) payload.name_en = v.name_en;
      if (this.editing.data_type === 'number') {
        if ((v.unit_ar || null) !== (this.editing.unit_ar ?? null)) payload.unit_ar = v.unit_ar || undefined;
        if ((v.unit_en || null) !== (this.editing.unit_en ?? null)) payload.unit_en = v.unit_en || undefined;
        if (v.min_value !== (this.editing.min_value ?? null)) payload.min_value = v.min_value ?? undefined;
        if (v.max_value !== (this.editing.max_value ?? null)) payload.max_value = v.max_value ?? undefined;
        if (v.decimal_places !== (this.editing.decimal_places ?? null)) payload.decimal_places = v.decimal_places ?? undefined;
      }
      this.adAttributesService.updateAttribute(payload).subscribe({
        next: () => this.onMutationSuccess(),
        error: (error) => this.onMutationError(error),
      });
    } else {
      const payload: CreateAttributeRequest = {
        code: v.code,
        name_ar: v.name_ar,
        name_en: v.name_en,
        data_type: v.data_type,
      };
      if (v.data_type === 'number') {
        if (v.unit_ar) payload.unit_ar = v.unit_ar;
        if (v.unit_en) payload.unit_en = v.unit_en;
        if (v.min_value !== null && v.min_value !== undefined) payload.min_value = Number(v.min_value);
        if (v.max_value !== null && v.max_value !== undefined) payload.max_value = Number(v.max_value);
        if (v.decimal_places !== null && v.decimal_places !== undefined) payload.decimal_places = Number(v.decimal_places);
      }
      if (v.data_type === 'select' && v.depends_on_attribute_id) {
        payload.depends_on_attribute_id = v.depends_on_attribute_id;
      }
      this.adAttributesService.createAttribute(payload).subscribe({
        next: () => this.onMutationSuccess(),
        error: (error) => this.onMutationError(error),
      });
    }
  }

  askDeactivate(attr: AdAttribute): void {
    this.pendingDeactivate = attr;
  }

  confirmDeactivate(): void {
    const attr = this.pendingDeactivate;
    this.pendingDeactivate = null;
    if (!attr || this.submitting) return;
    this.submitting = true;
    this.adAttributesService.deactivateAttribute(attr.id).subscribe({
      next: () => this.onMutationSuccess(),
      error: (error) => this.onMutationError(error),
    });
  }

  reactivate(attr: AdAttribute): void {
    if (this.submitting) return;
    this.submitting = true;
    this.adAttributesService.updateAttribute({ attributeId: attr.id, is_active: true }).subscribe({
      next: () => this.onMutationSuccess(),
      error: (error) => this.onMutationError(error),
    });
  }

  private onMutationSuccess(): void {
    this.submitting = false;
    this.closeForm();
    this.changed.emit();
  }

  private onMutationError(error: unknown): void {
    this.submitting = false;
    const code = extractApiErrorCode(error);
    this.formError = code && API_ERROR_CODE_KEYS[code]
      ? this.translationService.t(API_ERROR_CODE_KEYS[code])
      : this.errorHandler.getErrorMessage(error as never);
  }
}
