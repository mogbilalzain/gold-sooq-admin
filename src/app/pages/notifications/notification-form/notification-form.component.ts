import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/common/loading-spinner/loading-spinner.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../../shared/components/form/input/input-field.component';
import { LabelComponent } from '../../../shared/components/form/label/label.component';
import { TranslationService } from '../../../shared/services/translation.service';
import { NotificationsService } from '../../../shared/services/data/notifications.service';
import { ErrorHandlerService } from '../../../shared/services/api/error-handler.service';

@Component({
  selector: 'app-notification-form',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    ButtonComponent,
    InputFieldComponent,
    LabelComponent,
  ],
  templateUrl: './notification-form.component.html',
})
export class NotificationFormComponent {
  isSubmitting = false;
  errorMessage = '';

  title_ar = '';
  title_en = '';
  message_ar = '';
  message_en = '';

  constructor(
    private router: Router,
    public translationService: TranslationService,
    private notificationsService: NotificationsService,
    private errorHandler: ErrorHandlerService
  ) {}

  onSubmit() {
    if (!this.title_ar || !this.title_en || !this.message_ar || !this.message_en) {
      this.errorMessage = this.translationService.t('notifications.fillRequired');
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.notificationsService.sendNotification({
      title_ar: this.title_ar,
      title_en: this.title_en,
      message_ar: this.message_ar,
      message_en: this.message_en,
    }).subscribe({
      next: () => {
        this.router.navigate(['/notifications']);
      },
      error: (error) => {
        const apiError = this.errorHandler.handleError(error);
        this.errorMessage = apiError.message;
        this.isSubmitting = false;
      }
    });
  }

  onCancel() {
    this.router.navigate(['/notifications']);
  }

  onTitleArChange(value: string | number) {
    this.title_ar = String(value);
  }

  onTitleEnChange(value: string | number) {
    this.title_en = String(value);
  }

  onMessageArChange(value: string | number) {
    this.message_ar = String(value);
  }

  onMessageEnChange(value: string | number) {
    this.message_en = String(value);
  }
}

