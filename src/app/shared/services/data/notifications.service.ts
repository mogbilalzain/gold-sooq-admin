import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../api/api-config.service';
import { ErrorHandlerService } from '../api/error-handler.service';

export interface ApiResponse<T> {
  message: string;
  status: string;
  data: T;
}

export interface SendNotificationRequest {
  title_ar: string;
  title_en: string;
  message_ar: string;
  message_en: string;
  title?: string; // Deprecated - for backward compatibility
  message?: string; // Deprecated - for backward compatibility
}

export interface Notification {
  id: number;
  title_ar: string;
  title_en: string;
  message_ar: string;
  message_en: string;
  title?: string; // Deprecated
  message?: string; // Deprecated
  created_at: number;
  updated_at?: number;
  fcm_sent?: boolean;
}

export interface NotificationsListRequest {
  page?: number;
  limit?: number;
}

export interface NotificationsListResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private errorHandler: ErrorHandlerService
  ) {}

  sendNotification(request: SendNotificationRequest): Observable<ApiResponse<Notification>> {
    return this.http.post<ApiResponse<Notification>>(
      `${this.apiConfig.getAdminNotificationsUrl()}/sendNotification`,
      request
    );
  }

  listNotifications(request: NotificationsListRequest = {}): Observable<ApiResponse<NotificationsListResponse>> {
    const params: Record<string, string> = {};
    if (request.page) {
      params['page'] = String(request.page);
    }
    if (request.limit) {
      params['limit'] = String(request.limit);
    }
    return this.http.get<ApiResponse<NotificationsListResponse>>(
      `${this.apiConfig.getAdminNotificationsUrl()}/listNotifications`,
      { params }
    );
  }

  deleteNotification(id: number): Observable<ApiResponse<{ id: number; deleted: boolean; message: string }>> {
    return this.http.delete<ApiResponse<{ id: number; deleted: boolean; message: string }>>(
      `${this.apiConfig.getAdminNotificationsUrl()}/deleteNotification/${id}`
    );
  }
}

