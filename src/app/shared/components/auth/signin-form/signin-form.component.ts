import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { TranslationService } from '../../../services/translation.service';
import { ErrorHandlerService } from '../../../services/api/error-handler.service';

@Component({
  selector: 'app-signin-form',
  imports: [
    CommonModule,
    CheckboxComponent,
    ButtonComponent,
    InputFieldComponent,
    RouterModule,
  ],
  templateUrl: './signin-form.component.html',
  styles: ``
})
export class SigninFormComponent {

  isChecked = false;
  isLoading = false;
  errorMessage = '';

  phoneNumber = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    public translationService: TranslationService,
    private errorHandler: ErrorHandlerService
  ) {}

  onPhoneNumberChange(value: string | number) {
    this.phoneNumber = String(value);
  }

  onPasswordChange(value: string | number) {
    this.password = String(value);
  }

  onSignIn() {
    // Reset error message
    this.errorMessage = '';

    // Validate inputs
    if (!this.phoneNumber || !this.password) {
      this.errorMessage = this.translationService.t('auth.loginError');
      return;
    }

    // Set loading state
    this.isLoading = true;

    // Call login service
    this.authService.login({
      phoneNumber: this.phoneNumber,
      password: this.password
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status === 'success' && response.data) {
          // Reject access when the returned role is not an admin.
          if (response.data.role !== 'admin') {
            this.authService.logout();
            this.errorMessage = this.translationService.t('auth.notAdmin');
            return;
          }
          // Login successful - redirect to dashboard
          const returnUrl = this.router.parseUrl(this.router.url).queryParams['returnUrl'] || '/';
          this.router.navigate([returnUrl]);
        }
      },
      error: (error) => {
        this.isLoading = false;
        const apiError = this.errorHandler.handleError(error);
        this.errorMessage = apiError.message || this.translationService.t('auth.loginError');
      }
    });
  }
}
