import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/common/loading-spinner/loading-spinner.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../../shared/components/form/input/input-field.component';
import { LabelComponent } from '../../../shared/components/form/label/label.component';
import { CheckboxComponent } from '../../../shared/components/form/input/checkbox.component';
import { TranslationService } from '../../../shared/services/translation.service';
import { UsersService, User } from '../../../shared/services/data/users.service';
import { ErrorHandlerService } from '../../../shared/services/api/error-handler.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    ButtonComponent,
    InputFieldComponent,
    LabelComponent,
    CheckboxComponent,
  ],
  templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnInit {
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  userId: number | null = null;
  isEditMode = false;

  fullName = '';
  email = '';
  phoneNumber: number | null = null;
  isActive = true;
  isVerified = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public translationService: TranslationService,
    private usersService: UsersService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.userId = +params['id'];
        this.isEditMode = true;
        this.loadUser();
      }
    });
  }

  loadUser() {
    if (!this.userId) return;
    
    this.isLoading = true;
    
    this.usersService.listUsers({
      page: 1,
      limit: 1000,
      status: 'all'
    }).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          const user = response.data.users.find((u: User) => u.id === this.userId);
          if (user) {
            this.fullName = user.full_name || '';
            this.email = user.email || '';
            this.phoneNumber = user.phone_number ? parseInt(user.phone_number) : null;
            this.isActive = user.status === 'active';
            this.isVerified = user.verified === 1;
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        const apiError = this.errorHandler.handleError(error);
        this.errorMessage = apiError.message;
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    if (!this.fullName) {
      this.errorMessage = this.translationService.t('users.nameRequired');
      return;
    }

    if (!this.userId) {
      this.errorMessage = this.translationService.t('users.userIdRequired');
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.usersService.updateUser({
      userId: this.userId,
      fullName: this.fullName,
      email: this.email || undefined,
      phoneNumber: this.phoneNumber || undefined,
      verified: this.isVerified,
      status: this.isActive ? 'active' : 'inactive',
    }).subscribe({
      next: () => {
        this.router.navigate(['/users']);
      },
      error: (error) => {
        const apiError = this.errorHandler.handleError(error);
        this.errorMessage = apiError.message;
        this.isSubmitting = false;
      }
    });
  }

  onCancel() {
    this.router.navigate(['/users']);
  }

  onNameChange(value: string | number) {
    this.fullName = String(value);
  }

  onEmailChange(value: string | number) {
    this.email = String(value);
  }

  onPhoneNumberChange(value: string | number) {
    this.phoneNumber = value ? parseInt(String(value)) : null;
  }
}

