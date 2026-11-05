import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../api/api-config.service';

export interface ApiResponse<T> {
  message: string;
  status: string;
  data: T;
}

export const CONTACT_MESSAGE_STATUSES = ['new', 'read', 'in_progress', 'resolved', 'closed'] as const;
export type ContactMessageStatus = typeof CONTACT_MESSAGE_STATUSES[number];

export interface ContactMessage {
  id: number;
  inquiry_type: string;
  full_name: string;
  phone_code: string;
  phone: string;
  email: string;
  reference_number?: string | null;
  subject: string;
  message_body: string;
  status: ContactMessageStatus;
  admin_notes?: string | null;
  /** Epoch milliseconds. */
  created_at: number;
  /** Epoch milliseconds. */
  updated_at?: number;
}

export interface ListContactMessagesPayload {
  page?: number;
  limit?: number;
  status?: ContactMessageStatus;
}

export interface UpdateContactMessageStatusPayload {
  messageId: number;
  status: ContactMessageStatus;
  admin_notes?: string;
}

interface MessagesListData {
  messages: ContactMessage[];
  pagination: { page: number; limit: number; totalCount: number; totalPages: number };
}

@Injectable({ providedIn: 'root' })
export class ContactMessagesService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {}

  list(payload: ListContactMessagesPayload): Observable<ApiResponse<MessagesListData>> {
    return this.http.post<ApiResponse<MessagesListData>>(
      `${this.apiConfig.getAdminContactMessagesUrl()}/list`, payload);
  }

  /** Viewing a `new` message marks it as `read` on the server. */
  getById(messageId: number): Observable<ApiResponse<ContactMessage>> {
    return this.http.post<ApiResponse<ContactMessage>>(
      `${this.apiConfig.getAdminContactMessagesUrl()}/getById`, { messageId });
  }

  updateStatus(payload: UpdateContactMessageStatusPayload): Observable<ApiResponse<ContactMessage>> {
    return this.http.patch<ApiResponse<ContactMessage>>(
      `${this.apiConfig.getAdminContactMessagesUrl()}/updateStatus`, payload);
  }

  delete(messageId: number): Observable<ApiResponse<{ deleted: boolean; message: string }>> {
    return this.http.delete<ApiResponse<{ deleted: boolean; message: string }>>(
      `${this.apiConfig.getAdminContactMessagesUrl()}/delete/${messageId}`);
  }
}
