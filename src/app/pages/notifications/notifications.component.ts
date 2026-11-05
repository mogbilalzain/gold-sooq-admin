import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../shared/components/common/loading-spinner/loading-spinner.component';
import { PaginationComponent } from '../../shared/components/common/pagination/pagination.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
import { ConfirmDialogComponent } from '../../shared/components/common/confirm-dialog/confirm-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { TranslationService } from '../../shared/services/translation.service';
import { NotificationsService, Notification } from '../../shared/services/data/notifications.service';
import { ErrorHandlerService } from '../../shared/services/api/error-handler.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    PaginationComponent,
    ButtonComponent,
    ConfirmDialogComponent,
    MatTooltipModule,
    MatButtonModule,
  ],
  templateUrl: './notifications.component.html',
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  isLoading = false;
  errorMessage = '';

  currentPage = 1;
  limit = 20;
  total = 0;
  totalPages = 0;

  deleteTarget: Notification | null = null;
  actionProcessing = false;

  constructor(
    public translationService: TranslationService,
    private notificationsService: NotificationsService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.notificationsService.listNotifications({ page: this.currentPage, limit: this.limit }).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.notifications = response.data.notifications || [];
          this.total = response.data.pagination?.total ?? this.notifications.length;
          this.totalPages = response.data.pagination?.totalPages ?? 1;
          // Deleting the last item on the last page leaves it empty: step back one page.
          if (!this.notifications.length && this.currentPage > 1 && this.currentPage > this.totalPages) {
            this.currentPage = Math.max(1, this.totalPages);
            this.loadNotifications();
            return;
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

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadNotifications();
  }

  openDelete(notification: Notification) {
    this.deleteTarget = notification;
  }

  confirmDelete() {
    if (!this.deleteTarget) return;
    this.actionProcessing = true;
    this.notificationsService.deleteNotification(this.deleteTarget.id).subscribe({
      next: () => {
        this.actionProcessing = false;
        this.deleteTarget = null;
        this.loadNotifications();
      },
      error: (error) => {
        this.actionProcessing = false;
        this.deleteTarget = null;
        this.errorMessage = this.errorHandler.handleError(error).message;
      }
    });
  }

  getNotificationTitle(notification: Notification): string {
    return this.translationService.currentLanguageValue === 'ar' 
      ? notification.title_ar 
      : notification.title_en;
  }

  getNotificationMessage(notification: Notification): string {
    return this.translationService.currentLanguageValue === 'ar' 
      ? notification.message_ar 
      : notification.message_en;
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }
}

