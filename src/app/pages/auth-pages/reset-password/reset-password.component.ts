import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthPageLayoutComponent } from '../../../shared/layout/auth-page-layout/auth-page-layout.component';
import { InputFieldComponent } from '../../../shared/components/form/input/input-field.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { TranslationService } from '../../../shared/services/translation.service';
import { ErrorHandlerService } from '../../../shared/services/api/error-handler.service';

const RESET_PHONE_KEY = 'reset_phone_number';
const RESEND_SECONDS = 60;

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AuthPageLayoutComponent,
    InputFieldComponent,
    ButtonComponent,
  ],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  phoneNumber = '';
  otpCode = '';
  newPassword = '';
  confirmPassword = '';

  isLoading = false;
  isResending = false;
  errorMessage = '';

  resendCountdown = 0;
  private countdownTimer?: ReturnType<typeof setInterval>;

  constructor(
    private authService: AuthService,
    private router: Router,
    public translationService: TranslationService,
    private errorHandler: ErrorHandlerService
  ) {
    const nav = this.router.getCurrentNavigation();
    const statePhone = nav?.extras?.state?.['phoneNumber'] as string | undefined;
    this.phoneNumber = statePhone || sessionStorage.getItem(RESET_PHONE_KEY) || '';
  }

  ngOnInit() {
    if (!this.phoneNumber) {
      // No phone number available - restart the flow.
      this.router.navigate(['/forgot-password']);
      return;
    }
    this.startCountdown();
  }

  ngOnDestroy() {
    this.clearCountdown();
  }

  private startCountdown() {
    this.clearCountdown();
    this.resendCountdown = RESEND_SECONDS;
    this.countdownTimer = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        this.clearCountdown();
      }
    }, 1000);
  }

  private clearCountdown() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = undefined;
    }
  }

  get maskedPhone(): string {
    const p = this.phoneNumber;
    if (p.length <= 4) return p;
    return p.slice(0, 4) + '****' + p.slice(-2);
  }

  onOtpChange(value: string | number) {
    // Keep digits only, max 6.
    this.otpCode = String(value).replace(/\D/g, '').slice(0, 6);
  }

  onNewPasswordChange(value: string | number) {
    this.newPassword = String(value);
  }

  onConfirmPasswordChange(value: string | number) {
    this.confirmPassword = String(value);
  }

  onResendOtp() {
    if (this.resendCountdown > 0 || this.isResending) return;
    this.isResending = true;
    this.errorMessage = '';
    this.authService.sendOTP({ phoneNumber: this.phoneNumber }).subscribe({
      next: () => {
        this.isResending = false;
        this.startCountdown();
      },
      error: (error) => {
        this.isResending = false;
        const apiError = this.errorHandler.handleError(error);
        this.errorMessage = apiError.message;
      },
    });
  }

  onSubmit() {
    this.errorMessage = '';

    if (this.otpCode.length !== 6) {
      this.errorMessage = this.translationService.t('auth.reset.otpInvalid');
      return;
    }
    if (!this.newPassword.trim() || this.newPassword.length < 6) {
      this.errorMessage = this.translationService.t('auth.reset.passwordTooShort');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = this.translationService.t('auth.reset.passwordMismatch');
      return;
    }

    this.isLoading = true;
    this.authService.resetPassword({
      phoneNumber: this.phoneNumber,
      otpCode: Number(this.otpCode),
      newPassword: this.newPassword,
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 'success') {
          sessionStorage.removeItem(RESET_PHONE_KEY);
          // If a token was returned, the service already stored it -> go to dashboard.
          if (response.data?.token) {
            this.router.navigate(['/']);
          } else {
            this.router.navigate(['/signin']);
          }
        } else {
          this.errorMessage = response.message || this.translationService.t('auth.reset.resetError');
        }
      },
      error: (error) => {
        this.isLoading = false;
        const apiError = this.errorHandler.handleError(error);
        this.errorMessage = apiError.message || this.translationService.t('auth.reset.resetError');
      },
    });
  }
}
