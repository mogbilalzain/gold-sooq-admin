import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../shared/components/common/loading-spinner/loading-spinner.component';
import { PaginationComponent } from '../../shared/components/common/pagination/pagination.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../shared/components/form/input/input-field.component';
import { TranslationService } from '../../shared/services/translation.service';
import { UsersService, User } from '../../shared/services/data/users.service';
import { ErrorHandlerService } from '../../shared/services/api/error-handler.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    PaginationComponent,
    ButtonComponent,
    InputFieldComponent,
  ],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  isLoading = false;
  errorMessage = '';
  
  currentPage = 1;
  limit = 20;
  total = 0;
  totalPages = 0;

  // Filters
  statusFilter: 'active' | 'inactive' | 'all' = 'all';
  verifiedFilter: boolean | undefined = undefined;
  searchTerm = '';

  constructor(
    public translationService: TranslationService,
    private usersService: UsersService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.usersService.listUsers({
      page: this.currentPage,
      limit: this.limit,
      status: this.statusFilter,
      verified: this.verifiedFilter,
      searchTerm: this.searchTerm || undefined,
    }).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.users = response.data.users;
          this.total = response.data.pagination.total;
          this.totalPages = response.data.pagination.totalPages;
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

  // Helper methods to access user properties
  getUserFullName(user: User): string {
    return user.full_name || '';
  }

  getUserPhoneNumber(user: User): string {
    return user.phone_number || '';
  }

  getUserIsActive(user: User): boolean {
    return user.status === 'active';
  }

  getUserIsVerified(user: User): boolean {
    return user.verified === 1;
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadUsers();
  }

  onStatusFilterChange(status: 'active' | 'inactive' | 'all') {
    this.statusFilter = status;
    this.currentPage = 1;
    this.loadUsers();
  }

  onVerifiedFilterChange(verified: boolean | undefined) {
    this.verifiedFilter = verified;
    this.currentPage = 1;
    this.loadUsers();
  }

  onSearch() {
    this.currentPage = 1;
    this.loadUsers();
  }

  onSearchTermChange(value: string | number) {
    this.searchTerm = String(value);
  }

  onDelete(userId: number) {
    if (confirm(this.translationService.t('users.confirmDelete'))) {
      this.usersService.deleteUser({ userId }).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          const apiError = this.errorHandler.handleError(error);
          alert(apiError.message);
        }
      });
    }
  }

  toggleActive(user: User) {
    this.usersService.updateUser({
      userId: user.id,
      status: !this.getUserIsActive(user) ? 'active' : 'inactive'
    }).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (error) => {
        const apiError = this.errorHandler.handleError(error);
        alert(apiError.message);
      }
    });
  }

  toggleVerified(user: User) {
    this.usersService.updateUser({
      userId: user.id,
      verified: !this.getUserIsVerified(user)
    }).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (error) => {
        const apiError = this.errorHandler.handleError(error);
        alert(apiError.message);
      }
    });
  }
}

