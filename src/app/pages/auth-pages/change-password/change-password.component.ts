import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/layout/page-header/page-header.component';
import { InputFieldComponent } from '../../../shared/components/form/input/input-field.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { TranslationService } from '../../../shared/services/translation.service';
import { ErrorHandlerService } from '../../../shared/services/api/error-handler.service';
import { NotifyService } from '../../../shared/services/notify.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
  ],
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent {
  phoneNumber = '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    public translationService: TranslationService,
    private errorHandler: ErrorHandlerService,
    private notify: NotifyService
  ) {
    this.phoneNumber = this.authService.getCurrentUser()?.phoneNumber || '';
  }

  onCurrentChange(value: string | number) { this.currentPassword = String(value); }
  onNewChange(value: string | number) { this.newPassword = String(value); }
  onConfirmChange(value: string | number) { this.confirmPassword = String(value); }

  onSubmit() {
    this.errorMessage = '';

    if (!this.currentPassword.trim() || !this.newPassword.trim()) {
      this.errorMessage = this.translationService.t('auth.change.fillRequired');
      return;
    }
    if (this.newPassword.length < 6) {
      this.errorMessage = this.translationService.t('auth.reset.passwordTooShort');
      return;
    }
    if (this.newPassword === this.currentPassword) {
      this.errorMessage = this.translationService.t('auth.change.sameAsCurrent');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = this.translationService.t('auth.reset.passwordMismatch');
      return;
    }

    this.isLoading = true;
    this.authService.changePassword({
      phoneNumber: this.phoneNumber,
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 'success') {
          this.notify.success(this.translationService.t('auth.change.success'));
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
        } else {
          this.errorMessage = response.message || this.translationService.t('auth.change.error');
        }
      },
      error: (error) => {
        this.isLoading = false;
        const apiError = this.errorHandler.handleError(error);
        this.errorMessage = apiError.message || this.translationService.t('auth.change.error');
      },
    });
  }
}
