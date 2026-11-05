import { EnvironmentProviders, Injectable, inject, makeEnvironmentProviders, EventEmitter } from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogConfig } from '@angular/material/dialog';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Directionality, Direction } from '@angular/cdk/bidi';
import { TranslationService, Language } from '../services/translation.service';

/**
 * Paginator labels that follow the app's own TranslationService instead of
 * Material's static strings. Emits `changes` whenever the language flips.
 */
@Injectable()
export class AppPaginatorIntl extends MatPaginatorIntl {
  private readonly translationService = inject(TranslationService);

  constructor() {
    super();
    this.refresh();
    this.translationService.currentLanguage.subscribe(() => {
      this.refresh();
      this.changes.next();
    });
  }

  private refresh(): void {
    const t = this.translationService.getTranslations().common;
    this.itemsPerPageLabel = t.itemsPerPage;
    this.nextPageLabel = t.next;
    this.previousPageLabel = t.previous;
    this.firstPageLabel = t.firstPage;
    this.lastPageLabel = t.lastPage;
    this.getRangeLabel = (page: number, pageSize: number, length: number): string => {
      if (length === 0 || pageSize === 0) {
        return `0 ${t.of} ${length}`;
      }
      const startIndex = page * pageSize;
      const endIndex = Math.min(startIndex + pageSize, length);
      return `${startIndex + 1} - ${endIndex} ${t.of} ${length}`;
    };
  }
}

/**
 * CDK directionality that follows the app language (ar = rtl, en = ltr),
 * so form fields, menus and every overlay (dialogs, selects, snackbars)
 * flip with the language toggle without a reload.
 */
@Injectable({ providedIn: 'root' })
export class AppDirectionality extends Directionality {
  private readonly translationService = inject(TranslationService);
  override readonly change = new EventEmitter<Direction>();

  constructor() {
    super();
    const initial = this.translationService.isRTL ? 'rtl' : 'ltr';
    this.valueSignal.set(initial);
    this.translationService.currentLanguage.subscribe((lang: Language) => {
      const dir: Direction = lang === 'ar' ? 'rtl' : 'ltr';
      if (dir !== this.value) {
        this.valueSignal.set(dir);
        this.change.emit(dir);
      }
    });
  }
}

export function provideMaterialDefaults(): EnvironmentProviders {
  const formFieldDefaults: MatFormFieldDefaultOptions = {
    appearance: 'outline',
    subscriptSizing: 'dynamic',
  };

  const dialogDefaults: MatDialogConfig = {
    autoFocus: 'dialog',
    maxWidth: 'calc(100vw - 32px)',
    restoreFocus: true,
  };

  const snackBarDefaults: MatSnackBarConfig = {
    duration: 4000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
  };

  return makeEnvironmentProviders([
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: formFieldDefaults },
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: dialogDefaults },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: snackBarDefaults },
    { provide: MatPaginatorIntl, useClass: AppPaginatorIntl },
    { provide: Directionality, useExisting: AppDirectionality },
  ]);
}
