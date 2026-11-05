import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslationService } from '../../../shared/services/translation.service';
import { ErrorHandlerService } from '../../../shared/services/api/error-handler.service';
import {
  AdAttribute,
  AdAttributeOption,
  AdAttributesService,
  CreateOptionRequest,
  UpdateOptionRequest,
} from '../../../shared/services/data/ad-attributes.service';
import { ConfirmDialogComponent } from '../../../shared/components/common/confirm-dialog/confirm-dialog.component';
import { API_ERROR_CODE_KEYS, extractApiErrorCode } from '../../../shared/utils/api-error-codes';
import { toFlag } from '../../../shared/utils/verification';

/**
 * Options tab — only for select attributes.
 * Options come from the attributes/list response (no options/list endpoint
 * exists; none is invented). Reorder uses accessible up/down controls and
 * restores the server order when saving fails.
 */
@Component({
  selector: 'app-attribute-options',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ConfirmDialogComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  template: `
    <div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
      <mat-form-field class="w-full" subscriptSizing="dynamic">
        <mat-label>{{ translationService.t('options.selectAttribute') }}</mat-label>
        <mat-select
          [value]="selectedAttributeId ?? ''"
          (selectionChange)="onAttributeChange($event.value)"
        >
          <mat-option value="" disabled>{{ translationService.t('options.chooseAttribute') }}</mat-option>
          @for (attr of selectAttributes; track attr.id) {
            <mat-option [value]="attr.id">{{ attr.name_ar }} / {{ attr.name_en }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </div>

    @if (!selectAttributes.length && !loading) {
      <p class="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-10 text-center text-sm text-surface-on-surface-variant dark:border-outline-variant/20 dark:bg-surface-container-low">
        {{ translationService.t('options.noSelectAttributes') }}
      </p>
    } @else if (selectedAttribute) {
      @if (isDependent) {
        <p class="mb-4 rounded-xl border border-brand-200/60 bg-brand-500/5 p-3 text-xs text-brand-700 dark:border-brand-700/40 dark:text-brand-300">
          {{ translationService.t('options.dependentHint') }}: {{ parentAttributeName }}
        </p>
      }

      <div class="mb-4 flex items-center justify-between">
        <p class="text-sm text-surface-on-surface-variant">
          {{ translationService.t('options.count') }}: {{ orderedOptions.length }}
        </p>
        <div class="flex items-center gap-2">
          @if (orderDirty) {
            <button
              type="button"
              matButton="filled"
              (click)="saveOrder()"
              [disabled]="submitting"
              class="px-6"
            >
              {{ translationService.t(submitting ? 'common.saving' : 'options.saveOrder') }}
            </button>
            <button
              type="button"
              matButton="outlined"
              (click)="discardOrder()"
              [disabled]="submitting"
            >
              {{ translationService.t('common.cancel') }}
            </button>
          }
          <button
            type="button"
            matButton="filled"
            (click)="openCreateForm()"
            class="px-6"
          >
            {{ translationService.t('options.addOption') }}
          </button>
        </div>
      </div>

      @if (errorMessage) {
        <div class="mb-4 rounded-xl border border-error-200 bg-error-50 p-3 text-sm text-error-600 dark:border-error-800 dark:bg-error-900/20 dark:text-error-400">
          {{ errorMessage }}
        </div>
      }

      <!-- Option form -->
      @if (formVisible) {
        <form
          [formGroup]="form"
          (ngSubmit)="submitForm()"
          class="mb-6 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 dark:border-outline-variant/20 dark:bg-surface-container-low"
        >
          <h3 class="mb-4 text-m3-title-md font-semibold text-surface-on-surface">
            {{ translationService.t(editing ? 'options.editOption' : 'options.addOption') }}
          </h3>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <mat-form-field class="w-full" subscriptSizing="dynamic">
              <mat-label>{{ translationService.t('options.code') }}</mat-label>
              <input matInput formControlName="code" [readonly]="!!editing" dir="ltr" />
            </mat-form-field>
            <mat-form-field class="w-full" subscriptSizing="dynamic">
              <mat-label>{{ translationService.t('options.labelAr') }}</mat-label>
              <input matInput formControlName="label_ar" />
            </mat-form-field>
            <mat-form-field class="w-full" subscriptSizing="dynamic">
              <mat-label>{{ translationService.t('options.labelEn') }}</mat-label>
              <input matInput formControlName="label_en" dir="ltr" />
            </mat-form-field>
            <mat-form-field class="w-full" subscriptSizing="dynamic">
              <mat-label>{{ translationService.t('options.sortOrder') }}</mat-label>
              <input matInput formControlName="sort_order" type="number" dir="ltr" />
            </mat-form-field>
          </div>
          @if (isDependent) {
            <div class="mt-4 md:max-w-sm">
              <mat-form-field class="w-full" subscriptSizing="dynamic">
                <mat-label>{{ translationService.t('options.parentOption') }}</mat-label>
                <mat-select formControlName="parent_option_id">
                  <mat-option [value]="null" disabled>{{ translationService.t('options.chooseParentOption') }}</mat-option>
                  @for (opt of parentOptions; track opt.id) {
                    <mat-option [value]="opt.id">{{ opt.label_ar }} / {{ opt.label_en }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
          }
          @if (formError) {
            <p class="mt-3 text-sm text-error-600 dark:text-error-500">{{ formError }}</p>
          }
          <div class="mt-5 flex items-center gap-3">
            <button type="submit" matButton="filled" [disabled]="form.invalid || submitting"
                    class="px-6">
              {{ translationService.t(submitting ? 'common.saving' : 'common.save') }}
            </button>
            <button type="button" matButton="outlined" (click)="closeForm()">
              {{ translationService.t('common.cancel') }}
            </button>
          </div>
        </form>
      }

      <!-- Options list -->
      <div class="overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest dark:border-outline-variant/20 dark:bg-surface-container-low">
        @if (!orderedOptions.length) {
          <p class="p-10 text-center text-sm text-surface-on-surface-variant">
            {{ translationService.t('options.empty') }}
          </p>
        } @else {
          <ul>
            @for (option of orderedOptions; track option.id; let i = $index) {
              <li class="flex items-center gap-3 border-b border-outline-variant/20 p-3 last:border-0">
                <!-- Reorder controls -->
                <div class="flex flex-col">
                  <button
                    type="button"
                    mat-icon-button
                    (click)="moveOption(i, -1)"
                    [disabled]="i === 0 || submitting"
                    [matTooltip]="translationService.t('options.moveUp')"
                    [attr.aria-label]="translationService.t('options.moveUp')"
                    class="!text-surface-on-surface-variant"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                  </button>
                  <button
                    type="button"
                    mat-icon-button
                    (click)="moveOption(i, 1)"
                    [disabled]="i === orderedOptions.length - 1 || submitting"
                    [matTooltip]="translationService.t('options.moveDown')"
                    [attr.aria-label]="translationService.t('options.moveDown')"
                    class="!text-surface-on-surface-variant"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                </div>

                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold text-surface-on-surface">
                    {{ option.label_ar }} <span class="text-surface-on-surface-variant">/ {{ option.label_en }}</span>
                  </p>
                  <p class="text-xs text-surface-on-surface-variant" dir="ltr">{{ option.code }}</p>
                </div>

                @if (isDependent && option.parent_option_id) {
                  <span class="rounded-full bg-surface-container-high px-2.5 py-1 text-xs text-surface-on-surface-variant">
                    {{ parentOptionLabel(option.parent_option_id) }}
                  </span>
                }

                <span class="rounded-full px-2.5 py-1 text-xs font-semibold" [ngClass]="optionBadgeClass(option)">
                  {{ translationService.t(isOptionActive(option) ? 'common.active' : 'common.inactive') }}
                </span>

                <div class="flex items-center gap-1">
                  <button type="button" mat-icon-button (click)="openEditForm(option)"
                          [matTooltip]="translationService.t('common.edit')"
                          [attr.aria-label]="translationService.t('common.edit')"
                          class="!text-brand-600 dark:!text-brand-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    </svg>
                  </button>
                  @if (isOptionActive(option)) {
                    <button type="button" mat-icon-button (click)="askDeactivate(option)"
                            [matTooltip]="translationService.t('options.deactivate')"
                            [attr.aria-label]="translationService.t('options.deactivate')"
                            class="!text-[color:var(--color-error)]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>
                      </svg>
                    </button>
                  } @else {
                    <button type="button" mat-icon-button (click)="reactivate(option)" [disabled]="submitting"
                            [matTooltip]="translationService.t('options.reactivate')"
                            [attr.aria-label]="translationService.t('options.reactivate')"
                            class="!text-success-600 dark:!text-success-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
                      </svg>
                    </button>
                  }
                </div>
              </li>
            }
          </ul>
        }
      </div>
    }

    <app-confirm-dialog
      [open]="!!pendingDeactivate"
      [title]="translationService.t('options.deactivateTitle')"
      [message]="translationService.t('options.deactivateMessage')"
      [confirmLabel]="translationService.t('options.deactivate')"
      (confirmed)="confirmDeactivate()"
      (cancelled)="pendingDeactivate = null"
    ></app-confirm-dialog>
  `,
})
export class AttributeOptionsComponent implements OnChanges {
  @Input() attributes: AdAttribute[] = [];
  @Input() loading = false;
  @Output() changed = new EventEmitter<void>();

  readonly translationService = inject(TranslationService);
  private readonly fb = inject(FormBuilder);
  private readonly adAttributesService = inject(AdAttributesService);
  private readonly errorHandler = inject(ErrorHandlerService);

  selectedAttributeId: number | null = null;
  orderedOptions: AdAttributeOption[] = [];
  orderDirty = false;

  formVisible = false;
  editing: AdAttributeOption | null = null;
  submitting = false;
  formError = '';
  errorMessage = '';
  pendingDeactivate: AdAttributeOption | null = null;

  form: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^[a-z0-9_]+$/)]],
    label_ar: ['', Validators.required],
    label_en: ['', Validators.required],
    sort_order: [null as number | null],
    parent_option_id: [null as number | null],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['attributes'] && !this.orderDirty) {
      this.syncOptionsFromAttributes();
    }
    if (changes['attributes'] && this.selectedAttributeId && !this.selectedAttribute) {
      this.selectedAttributeId = null;
      this.orderedOptions = [];
    }
  }

  get selectAttributes(): AdAttribute[] {
    return this.attributes.filter((a) => a.data_type === 'select');
  }

  get selectedAttribute(): AdAttribute | null {
    return this.selectAttributes.find((a) => a.id === this.selectedAttributeId) ?? null;
  }

  get isDependent(): boolean {
    return !!this.selectedAttribute?.depends_on_attribute_id;
  }

  get parentAttribute(): AdAttribute | null {
    const parentId = this.selectedAttribute?.depends_on_attribute_id;
    if (!parentId) return null;
    return this.attributes.find((a) => a.id === parentId) ?? null;
  }

  get parentAttributeName(): string {
    const parent = this.parentAttribute;
    return parent ? `${parent.name_ar} / ${parent.name_en}` : '';
  }

  get parentOptions(): AdAttributeOption[] {
    return (this.parentAttribute?.options ?? []).filter((o) => this.isOptionActive(o));
  }

  onAttributeChange(value: number | string): void {
    this.selectedAttributeId = value ? Number(value) : null;
    this.orderDirty = false;
    this.closeForm();
    this.syncOptionsFromAttributes();
  }

  private syncOptionsFromAttributes(): void {
    const options = [...(this.selectedAttribute?.options ?? [])];
    options.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    this.orderedOptions = options;
  }

  moveOption(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (target < 0 || target >= this.orderedOptions.length) return;
    const options = [...this.orderedOptions];
    [options[index], options[target]] = [options[target], options[index]];
    this.orderedOptions = options;
    this.orderDirty = true;
  }

  saveOrder(): void {
    if (!this.selectedAttributeId || this.submitting) return;
    this.submitting = true;
    this.errorMessage = '';
    const attributeId = this.selectedAttributeId;
    const optionIds = this.orderedOptions.map((o) => o.id);
    this.adAttributesService.reorderOptions(attributeId, optionIds).subscribe({
      next: () => {
        this.submitting = false;
        this.orderDirty = false;
        this.changed.emit();
      },
      error: (error) => {
        this.submitting = false;
        // Restore the server order — the parent refetches attributes.
        this.orderDirty = false;
        this.errorMessage = this.describeError(error);
        this.changed.emit();
      },
    });
  }

  discardOrder(): void {
    this.orderDirty = false;
    this.syncOptionsFromAttributes();
  }

  openCreateForm(): void {
    this.editing = null;
    this.formError = '';
    this.form.reset({ code: '', label_ar: '', label_en: '', sort_order: null, parent_option_id: null });
    this.form.get('code')?.enable();
    if (this.isDependent) {
      this.form.get('parent_option_id')?.setValidators(Validators.required);
    } else {
      this.form.get('parent_option_id')?.clearValidators();
    }
    this.form.get('parent_option_id')?.updateValueAndValidity();
    this.formVisible = true;
  }

  openEditForm(option: AdAttributeOption): void {
    this.editing = option;
    this.formError = '';
    this.form.reset({
      code: option.code ?? '',
      label_ar: option.label_ar,
      label_en: option.label_en,
      sort_order: option.sort_order ?? null,
      parent_option_id: option.parent_option_id ?? null,
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
    if (this.form.invalid || this.submitting || !this.selectedAttributeId) return;
    this.submitting = true;
    this.formError = '';
    const v = this.form.getRawValue();

    if (this.editing) {
      // Partial update: only changed fields.
      const payload: UpdateOptionRequest = { optionId: this.editing.id };
      if (v.label_ar !== this.editing.label_ar) payload.label_ar = v.label_ar;
      if (v.label_en !== this.editing.label_en) payload.label_en = v.label_en;
      if ((v.sort_order ?? null) !== (this.editing.sort_order ?? null)) {
        payload.sort_order = v.sort_order ?? undefined;
      }
      if ((v.parent_option_id ?? null) !== (this.editing.parent_option_id ?? null)) {
        payload.parent_option_id = v.parent_option_id ?? undefined;
      }
      this.adAttributesService.updateOption(payload).subscribe({
        next: () => this.onMutationSuccess(),
        error: (error) => this.onMutationError(error),
      });
    } else {
      const payload: CreateOptionRequest = {
        attributeId: this.selectedAttributeId,
        code: v.code,
        label_ar: v.label_ar,
        label_en: v.label_en,
      };
      if (v.sort_order !== null && v.sort_order !== undefined) payload.sort_order = Number(v.sort_order);
      if (this.isDependent) payload.parent_option_id = v.parent_option_id;
      this.adAttributesService.createOption(payload).subscribe({
        next: () => this.onMutationSuccess(),
        error: (error) => this.onMutationError(error),
      });
    }
  }

  askDeactivate(option: AdAttributeOption): void {
    this.pendingDeactivate = option;
  }

  confirmDeactivate(): void {
    const option = this.pendingDeactivate;
    this.pendingDeactivate = null;
    if (!option || this.submitting) return;
    this.submitting = true;
    this.adAttributesService.deactivateOption(option.id).subscribe({
      next: () => this.onMutationSuccess(),
      error: (error) => this.onMutationError(error),
    });
  }

  reactivate(option: AdAttributeOption): void {
    if (this.submitting) return;
    this.submitting = true;
    this.adAttributesService.updateOption({ optionId: option.id, is_active: true }).subscribe({
      next: () => this.onMutationSuccess(),
      error: (error) => this.onMutationError(error),
    });
  }

  isOptionActive(option: AdAttributeOption): boolean {
    return toFlag(option.is_active ?? true);
  }

  optionBadgeClass(option: AdAttributeOption): string {
    return this.isOptionActive(option)
      ? 'bg-success-50 text-success-600 dark:bg-success-500/15'
      : 'bg-surface-container-high text-surface-on-surface-variant';
  }

  parentOptionLabel(parentOptionId: number): string {
    const option = this.parentAttribute?.options?.find((o) => o.id === parentOptionId);
    return option ? `${option.label_ar} / ${option.label_en}` : `#${parentOptionId}`;
  }

  private onMutationSuccess(): void {
    this.submitting = false;
    this.closeForm();
    this.changed.emit();
  }

  private onMutationError(error: unknown): void {
    this.submitting = false;
    this.formError = this.describeError(error);
  }

  private describeError(error: unknown): string {
    const code = extractApiErrorCode(error);
    return code && API_ERROR_CODE_KEYS[code]
      ? this.translationService.t(API_ERROR_CODE_KEYS[code])
      : this.errorHandler.getErrorMessage(error as never);
  }
}
