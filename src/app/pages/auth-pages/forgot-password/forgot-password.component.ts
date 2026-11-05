import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthPageLayoutComponent } from '../../../shared/layout/auth-page-layout/auth-page-layout.component';
import { InputFieldComponent } from '../../../shared/components/form/input/input-field.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { TranslationService } from '../../../shared/services/translation.service';
import { ErrorHandlerService } from '../../../shared/services/api/error-handler.service';

const RESET_PHONE_KEY = 'reset_phone_number';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AuthPageLayoutComponent,
    InputFieldComponent,
    ButtonComponent,
  ],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  phoneNumber = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    public translationService: TranslationService,
    private errorHandler: ErrorHandlerService
  ) {}

  onPhoneNumberChange(value: string | number) {
    this.phoneNumber = String(value);
  }

  private isValidPhone(phone: string): boolean {
    return /^\+?[1-9]\d{7,14}$/.test(phone.trim());
  }

  onSubmit() {
    this.errorMessage = '';
    const phone = this.phoneNumber.trim();

    if (!phone) {
      this.errorMessage = this.translationService.t('auth.forgot.phoneRequired');
      return;
    }
    if (!this.isValidPhone(phone)) {
      this.errorMessage = this.translationService.t('auth.forgot.phoneInvalid');
      return;
    }

    this.isLoading = true;
    this.authService.sendOTP({ phoneNumber: phone }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 'success') {
          sessionStorage.setItem(RESET_PHONE_KEY, phone);
          this.router.navigate(['/reset-password'], { state: { phoneNumber: phone } });
        } else {
          this.errorMessage = response.message || this.translationService.t('auth.forgot.sendError');
        }
      },
      error: (error) => {
        this.isLoading = false;
        const apiError = this.errorHandler.handleError(error);
        this.errorMessage = apiError.message || this.translationService.t('auth.forgot.sendError');
      },
    });
  }
}
