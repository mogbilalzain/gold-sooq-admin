import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../api/api-config.service';

export interface ApiResponse<T> {
  message: string;
  status: string;
  data: T;
}

export type IdentityRequestStatus =
  | 'draft' | 'pending' | 'more_info_required' | 'approved' | 'rejected' | 'cancelled';

/** Postman reason codes (provisional contract — features/API_CONTRACT_NOTES.md). */
export const IDENTITY_REASON_CODES = [
  'id_front_unreadable', 'id_back_unreadable', 'selfie_mismatch', 'selfie_unreadable',
  'id_expired', 'id_not_uae', 'name_mismatch', 'photo_mismatch',
  'document_tampered', 'policy_violation', 'other',
] as const;
export type IdentityReasonCode = typeof IDENTITY_REASON_CODES[number];

export const IDENTITY_MISSING_ITEMS = ['id_front', 'id_back', 'selfie'] as const;
export type IdentityMissingItem = typeof IDENTITY_MISSING_ITEMS[number];

export interface IdentityRequestSummary {
  id: number;
  user_id: number;
  /** Joined from users (list) — named full_name by the backend. */
  full_name?: string;
  phone_number?: string;
  account_type?: string;
  identity_status?: string;
  status: IdentityRequestStatus;
  /** Last 4 digits only (CHAR(4)); never a full masked number. */
  id_number_last4?: string | null;
  id_expiry_date?: string | null;
  submitted_at?: string;
  reviewed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface IdentityRequestEvent {
  id?: number;
  event?: string;
  type?: string;
  /** Backend column is actor_type ('user' | 'admin' | 'system'). */
  actor_type?: string;
  actor_id?: number | null;
  reason_code?: string | null;
  user_message?: string | null;
  internal_note?: string | null;
  created_at?: string;
  [key: string]: unknown;
}

/** Short-lived (120s) signed document URLs — open immediately, never persist. */
export interface IdentityDocumentUrls {
  url: string;
  expiresAt?: string;
}

/** The raw user_identity_verifications row (no joined user fields on getById). */
export interface IdentityRequestDetails extends IdentityRequestSummary {
  full_name_on_id?: string | null;
}

/**
 * Backend getById envelope: viewUrls/events/possibleDuplicate are siblings of
 * `request` inside `data`, NOT fields on the request row.
 */
export interface IdentityDetailsData {
  request: IdentityRequestDetails;
  viewUrls?: {
    front?: IdentityDocumentUrls | string | null;
    back?: IdentityDocumentUrls | string | null;
    selfie?: IdentityDocumentUrls | string | null;
  };
  possibleDuplicate?: boolean;
  events?: IdentityRequestEvent[];
}

export interface ListIdentityRequestsPayload {
  page?: number;
  limit?: number;
  status?: IdentityRequestStatus | 'all';
  userId?: number;
}

export interface ApproveIdentityPayload {
  requestId: number;
  /** 15-digit Emirates ID read from the document image by the reviewer. */
  idNumberFromDocument: string;
  /** YYYY-MM-DD, must be in the future (Asia/Dubai). */
  idExpiryDateFromDocument: string;
  internalNote?: string;
}

export interface IdentityMoreInfoPayload {
  requestId: number;
  reasonCode: IdentityReasonCode;
  userMessage?: string;
  missingItems?: IdentityMissingItem[];
  internalNote?: string;
}

export interface RejectIdentityPayload {
  requestId: number;
  reasonCode: IdentityReasonCode;
  userMessage?: string;
  internalNote?: string;
}

export interface RevokeIdentityPayload {
  userId: number;
  reasonCode: IdentityReasonCode;
  internalNote?: string;
}

interface RequestsListData {
  requests: IdentityRequestSummary[];
  pagination: { total: number; totalPages: number; page?: number; limit?: number };
}

@Injectable({ providedIn: 'root' })
export class IdentityService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {}

  list(payload: ListIdentityRequestsPayload): Observable<ApiResponse<RequestsListData>> {
    return this.http.post<ApiResponse<RequestsListData>>(
      `${this.apiConfig.getAdminIdentityUrl()}/list`, payload);
  }

  getById(requestId: number): Observable<ApiResponse<IdentityDetailsData>> {
    return this.http.post<ApiResponse<IdentityDetailsData>>(
      `${this.apiConfig.getAdminIdentityUrl()}/getById`, { requestId });
  }

  approve(payload: ApproveIdentityPayload): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.apiConfig.getAdminIdentityUrl()}/approve`, payload);
  }

  requestMoreInfo(payload: IdentityMoreInfoPayload): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.apiConfig.getAdminIdentityUrl()}/requestMoreInfo`, payload);
  }

  reject(payload: RejectIdentityPayload): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.apiConfig.getAdminIdentityUrl()}/reject`, payload);
  }

  revoke(payload: RevokeIdentityPayload): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.apiConfig.getAdminIdentityUrl()}/revoke`, payload);
  }
}
