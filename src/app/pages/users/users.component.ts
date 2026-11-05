import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../shared/components/common/loading-spinner/loading-spinner.component';
import { PaginationComponent } from '../../shared/components/common/pagination/pagination.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../shared/components/form/input/input-field.component';
import { ConfirmDialogComponent } from '../../shared/components/common/confirm-dialog/confirm-dialog.component';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule, MatChipSelectionChange } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslationService } from '../../shared/services/translation.service';
import { UsersService, User } from '../../shared/services/data/users.service';
import { ErrorHandlerService } from '../../shared/services/api/error-handler.service';
import { AuthService } from '../../shared/services/auth/auth.service';
import { toFlag } from '../../shared/utils/verification';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
    ConfirmDialogComponent,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  displayedColumns = ['name', 'accountType', 'phone', 'identityStatus', 'status', 'verified', 'actions'];
  isLoading = false;
  errorMessage = '';

  currentPage = 1;
  limit = 20;
  total = 0;
  totalPages = 0;

  // Filters
  statusFilter: 'active' | 'inactive' | 'all' = 'all';
  verifiedFilter: boolean | undefined = undefined;
  accountTypeFilter: 'individual' | 'business' | 'all' = 'all';
  identityStatusFilter: 'unverified' | 'verified' | 'expired' | 'revoked' | 'all' = 'all';
  searchTerm = '';

  private searchInput$ = new Subject<string>();

  deleteTarget: User | null = null;
  actionProcessing = false;
  currentUserId: number | null = null;

  constructor(
    public translationService: TranslationService,
    private usersService: UsersService,
    private errorHandler: ErrorHandlerService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUserId = this.authService.getCurrentUser()?.id ?? null;
    this.searchInput$
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.loadUsers();
      });
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
      accountType: this.accountTypeFilter,
      identityStatus: this.identityStatusFilter,
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

  /** Null account_type (pre-migration accounts) counts as individual. */
  isBusiness(user: User): boolean {
    return user.account_type === 'business' || user.sellerType === 'business';
  }

  identityVerified(user: User): boolean {
    return toFlag(user.isIdentityVerified) || user.identity_status === 'verified';
  }

  businessVerified(user: User): boolean {
    return toFlag(user.isBusinessVerified) || user.businessProfileStatus === 'verified';
  }

  onAccountTypeFilterChange(value: string) {
    this.accountTypeFilter = (value || 'all') as typeof this.accountTypeFilter;
    this.currentPage = 1;
    this.loadUsers();
  }

  onIdentityStatusFilterChange(value: string) {
    this.identityStatusFilter = (value || 'all') as typeof this.identityStatusFilter;
    this.currentPage = 1;
    this.loadUsers();
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

  /** Single-select chip group: re-select the chip if the user clicks the active one. */
  pickStatus(event: MatChipSelectionChange, status: 'active' | 'inactive' | 'all') {
    if (event.selected) {
      this.onStatusFilterChange(status);
    } else {
      event.source.select();
    }
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
    this.searchInput$.next(this.searchTerm);
  }

  openDelete(user: User) {
    // Prevent an admin from deleting their own account.
    if (this.currentUserId !== null && user.id === this.currentUserId) {
      this.errorMessage = this.translationService.t('users.cannotDeleteSelf');
      return;
    }
    this.deleteTarget = user;
  }

  confirmDelete() {
    if (!this.deleteTarget) return;
    this.actionProcessing = true;
    this.usersService.deleteUser({ userId: this.deleteTarget.id }).subscribe({
      next: () => {
        this.actionProcessing = false;
        this.deleteTarget = null;
        this.loadUsers();
      },
      error: (error) => {
        this.actionProcessing = false;
        this.deleteTarget = null;
        this.errorMessage = this.translationService.translateApiError(this.errorHandler.handleError(error).message);
      }
    });
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
        this.errorMessage = this.errorHandler.handleError(error).message;
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
        this.errorMessage = this.errorHandler.handleError(error).message;
      }
    });
  }
}

