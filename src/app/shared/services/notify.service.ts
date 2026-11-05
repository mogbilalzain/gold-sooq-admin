import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslationService } from './translation.service';

/**
 * Thin wrapper around MatSnackBar so pages show one-line feedback
 * instead of hand-rolled success banners.
 */
@Injectable({ providedIn: 'root' })
export class NotifyService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly translationService = inject(TranslationService);

  success(message: string): void {
    this.snackBar.open(message, this.translationService.t('common.close') || 'OK', {
      duration: 4000,
      panelClass: ['snackbar-success'],
    });
  }

  error(message: string): void {
    this.snackBar.open(message, this.translationService.t('common.close') || 'OK', {
      duration: 5000,
      panelClass: ['snackbar-error'],
    });
  }
}
