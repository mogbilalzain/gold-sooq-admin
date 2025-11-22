import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/layout/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../shared/components/common/loading-spinner/loading-spinner.component';
import { ButtonComponent } from '../../shared/components/ui/button/button.component';
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
    ButtonComponent,
  ],
  templateUrl: './notifications.component.html',
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  isLoading = false;
  errorMessage = '';

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
    
    this.notificationsService.listNotifications().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data) {
          this.notifications = response.data.notifications || [];
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

  onDelete(notificationId: number) {
    if (confirm(this.translationService.t('notifications.confirmDelete'))) {
      this.notificationsService.deleteNotification(notificationId).subscribe({
        next: () => {
          this.loadNotifications();
        },
        error: (error) => {
          const apiError = this.errorHandler.handleError(error);
          alert(apiError.message);
        }
      });
    }
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

