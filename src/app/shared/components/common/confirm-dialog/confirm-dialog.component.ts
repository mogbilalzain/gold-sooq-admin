import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslationService } from '../../../services/translation.service';

export type ConfirmDialogVariant = 'default' | 'destructive';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <ng-template #dialogTpl>
      <div class="flex items-start gap-4 p-6 pb-0">
        <span
          class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full"
          [ngClass]="variant === 'destructive'
            ? 'bg-[color:var(--color-error-container)] text-[color:var(--color-on-error-container)]'
            : 'bg-[color:var(--color-primary-container)] text-[color:var(--color-on-primary-container)]'"
        >
          @if (variant === 'destructive') {
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0 3.75h.008M10.34 3.94l-8.4 14.55A1.5 1.5 0 003.24 21h17.52a1.5 1.5 0 001.3-2.25l-8.4-14.55a1.5 1.5 0 00-2.6 0z" />
            </svg>
          } @else {
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          }
        </span>

        <div class="min-w-0 flex-1">
          <h3
            [id]="titleId"
            class="text-m3-headline-sm font-normal text-[color:var(--color-on-surface)]"
          >
            {{ title }}
          </h3>
          @if (message) {
            <p
              [id]="messageId"
              class="mt-3 text-m3-body-md text-[color:var(--color-on-surface-variant)]"
            >
              {{ message }}
            </p>
          }
          <ng-content></ng-content>
        </div>
      </div>

      <div
        class="flex items-center justify-end gap-3 p-6 pt-6"
        [ngClass]="{ 'flex-row-reverse': translationService.isRTL }"
      >
        <button
          type="button"
          matButton="text"
          [disabled]="processing"
          (click)="onCancel()"
        >
          {{ cancelLabel || translationService.t('common.cancel') }}
        </button>
        <button
          type="button"
          matButton="filled"
          [ngClass]="variant === 'destructive' ? 'app-btn-danger' : ''"
          [disabled]="processing"
          (click)="onConfirm()"
        >
          @if (processing) {
            <span class="inline-flex items-center gap-2">
              <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
              {{ translationService.t('common.loading') }}
            </span>
          } @else {
            {{ confirmLabel || translationService.t('common.confirm') }}
          }
        </button>
      </div>
    </ng-template>
  `,
})
export class ConfirmDialogComponent implements OnChanges {
  @Input() open = false;
  @Input() title = '';
  @Input() message = '';
  @Input() confirmLabel = '';
  @Input() cancelLabel = '';
  @Input() variant: ConfirmDialogVariant = 'default';
  @Input() processing = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  @ViewChild('dialogTpl', { static: true }) dialogTpl!: TemplateRef<unknown>;

  private readonly dialog = inject(MatDialog);
  private dialogRef: MatDialogRef<unknown> | null = null;

  private readonly uid = Math.random().toString(36).slice(2, 9);
  readonly titleId = `confirm-title-${this.uid}`;
  readonly messageId = `confirm-message-${this.uid}`;

  constructor(public translationService: TranslationService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!('open' in changes)) return;
    if (this.open && !this.dialogRef) {
      this.dialogRef = this.dialog.open(this.dialogTpl, {
        width: '420px',
        disableClose: true,
        ariaLabelledBy: this.titleId,
        ariaDescribedBy: this.message ? this.messageId : null,
      });
      this.dialogRef.afterClosed().subscribe(() => {
        this.dialogRef = null;
        if (this.open) {
          this.open = false;
          this.cancelled.emit();
        }
      });
    } else if (!this.open && this.dialogRef) {
      this.dialogRef.close();
    }
    this.dialogRef?.disableClose && (this.dialogRef.disableClose = this.processing);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open && !this.processing) {
      this.onCancel();
    }
  }

  onConfirm(): void {
    if (!this.processing) {
      this.confirmed.emit();
    }
  }

  onCancel(): void {
    if (!this.processing) {
      this.cancelled.emit();
      this.dialogRef?.close();
    }
  }
}
