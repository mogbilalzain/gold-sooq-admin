import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../api/api-config.service';

export interface ApiResponse<T> {
  message: string;
  status: string;
  data: T;
}

export type BusinessRequestStatus =
  | 'draft' | 'pending' | 'more_info_required' | 'approved' | 'rejected' | 'cancelled';

export const BUSINESS_AUTHORITIES = [
  'DED_DUBAI', 'ADDED', 'SEDD_SHARJAH', 'DED_AJMAN', 'DED_UAQ',
  'DED_RAK', 'DED_FUJAIRAH', 'DMCC', 'JAFZA', 'RAKEZ', 'OTHER_FREEZONE',
] as const;
export type BusinessAuthority = typeof BUSINESS_AUTHORITIES[number];

export const BUSINESS_REASON_CODES = [
  'license_unreadable', 'license_expired', 'license_mismatch', 'authority_mismatch',
  'name_mismatch', 'authorization_missing', 'authorization_unreadable',
  'not_authorized_person', 'document_tampered', 'policy_violation', 'other',
] as const;
export type BusinessReasonCode = typeof BUSINESS_REASON_CODES[number];

export const BUSINESS_MISSING_ITEMS = ['license', 'authorization', 'legal_name', 'trade_name', 'address'] as const;
export type BusinessMissingItem = typeof BUSINESS_MISSING_ITEMS[number];

export const BUSINESS_KINDS = ['store', 'company'] as const;
export type BusinessKind = typeof BUSINESS_KINDS[number];

export const BUSINESS_ACTIVITIES = ['jewelry_store', 'bullion_trading', 'supplier', 'workshop', 'other'] as const;
export type BusinessActivity = typeof BUSINESS_ACTIVITIES[number];

export interface BusinessRequestSummary {
  id: number;
  user_id: number;
  /** Joined from users (list) — named full_name by the backend. */
  full_name?: string;
  phone_number?: string;
  status: BusinessRequestStatus;
  trade_name?: string | null;
  legal_name?: string | null;
  authority_code?: BusinessAuthority | string;
  authority_name?: string | null;
  /** User-submitted license number (raw, up to 64 chars) — the backend has no masked variant. */
  license_number_raw?: string | null;
  license_expiry_date?: string | null;
  business_kind?: BusinessKind;
  activity_type?: BusinessActivity;
  submitted_at?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface BusinessRequestEvent {
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

export interface BusinessDocumentUrls {
  url: string;
  expiresAt?: string;
}

/** The raw business_verification_requests row (no joined user fields on getById). */
export interface BusinessRequestDetails extends BusinessRequestSummary {
  emirate_state_id?: number | null;
}

/** Applicant's identity state, attached by the backend on getById. */
export interface BusinessIdentitySummary {
  identityStatus: string;
  identityExpiresOn?: string | null;
}

/**
 * Backend getById envelope: profile/viewUrls/identitySummary/possibleDuplicate/events
 * are siblings of `request` inside `data`, NOT fields on the request row.
 */
export interface BusinessDetailsData {
  request: BusinessRequestDetails;
  profile?: Record<string, unknown> | null;
  viewUrls?: {
    license?: BusinessDocumentUrls | string | null;
    authorization?: BusinessDocumentUrls | string | null;
  };
  identitySummary?: BusinessIdentitySummary | null;
  possibleDuplicate?: boolean;
  events?: BusinessRequestEvent[];
}

export interface ListBusinessRequestsPayload {
  page?: number;
  limit?: number;
  status?: BusinessRequestStatus | 'all';
  userId?: number;
  authorityCode?: BusinessAuthority | '';
}

export interface CheckLicensePayload {
  authorityCode: BusinessAuthority;
  authorityName?: string | null;
  licenseNumber: string;
}

/** Backend checkLicense result — includes the claiming user when already taken. */
export interface CheckLicenseResult {
  authorityKey: string;
  normalizedNumber: string;
  claimed: boolean;
  claimedUserId: number | null;
}

export interface ApproveBusinessPayload {
  requestId: number;
  legalNameFromDocument: string;
  licenseNumberFromDocument: string;
  authorityCodeFromDocument: BusinessAuthority;
  authorityNameFromDocument?: string | null;
  licenseExpiryDateFromDocument: string;
  tradeNameConfirmed: string;
  businessKindConfirmed: BusinessKind;
  activityTypeConfirmed: BusinessActivity;
  emirateStateIdConfirmed: number;
  internalNote?: string;
}

export interface BusinessMoreInfoPayload {
  requestId: number;
  reasonCode: BusinessReasonCode;
  userMessage?: string;
  missingItems?: BusinessMissingItem[];
  internalNote?: string;
}

export interface RejectBusinessPayload {
  requestId: number;
  reasonCode: BusinessReasonCode;
  userMessage?: string;
  internalNote?: string;
}

export interface RevokeBusinessPayload {
  userId: number;
  reasonCode: BusinessReasonCode;
  internalNote?: string;
}

export type BusinessProfileStatus = 'verified' | 'expired' | 'revoked' | 'unverified';

export interface SocialLink {
  platform: string;
  url: string;
}

export interface WorkingHoursEntry {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export interface BusinessPublicProfile {
  userId: number;
  profileStatus: BusinessProfileStatus;
  tradeName?: string | null;
  legalName?: string | null;
  licenseNumberLast4?: string | null;
  licenseExpiresOn?: string | null;
  businessKind?: BusinessKind | string;
  activityType?: BusinessActivity | string;
  authorityName?: string | null;
  description?: string | null;
  addressLine?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  websiteUrl?: string | null;
  socialLinks?: SocialLink[];
  workingHours?: WorkingHoursEntry[];
  logoUrl?: string | null;
  coverUrl?: string | null;
  logoStorageKey?: string | null;
  coverStorageKey?: string | null;
}

/** Partial update — only changed fields; null clears logo/cover. */
export interface UpdateBusinessProfilePayload {
  userId: number;
  tradeName?: string;
  description?: string;
  contactPhone?: string;
  contactEmail?: string;
  addressLine?: string;
  websiteUrl?: string;
  socialLinks?: SocialLink[];
  workingHours?: WorkingHoursEntry[];
  logoStorageKey?: string | null;
  coverStorageKey?: string | null;
}

interface RequestsListData {
  requests: BusinessRequestSummary[];
  pagination: { total: number; totalPages: number; page?: number; limit?: number };
}

@Injectable({ providedIn: 'root' })
export class BusinessService {
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {}

  list(payload: ListBusinessRequestsPayload): Observable<ApiResponse<RequestsListData>> {
    return this.http.post<ApiResponse<RequestsListData>>(
      `${this.apiConfig.getAdminBusinessUrl()}/list`, payload);
  }

  getById(requestId: number): Observable<ApiResponse<BusinessDetailsData>> {
    return this.http.post<ApiResponse<BusinessDetailsData>>(
      `${this.apiConfig.getAdminBusinessUrl()}/getById`, { requestId });
  }

  checkLicense(payload: CheckLicensePayload): Observable<ApiResponse<CheckLicenseResult>> {
    return this.http.post<ApiResponse<CheckLicenseResult>>(
      `${this.apiConfig.getAdminBusinessUrl()}/checkLicense`, payload);
  }

  approve(payload: ApproveBusinessPayload): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.apiConfig.getAdminBusinessUrl()}/approve`, payload);
  }

  requestMoreInfo(payload: BusinessMoreInfoPayload): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.apiConfig.getAdminBusinessUrl()}/requestMoreInfo`, payload);
  }

  reject(payload: RejectBusinessPayload): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.apiConfig.getAdminBusinessUrl()}/reject`, payload);
  }

  revoke(payload: RevokeBusinessPayload): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.apiConfig.getAdminBusinessUrl()}/revoke`, payload);
  }

  getPublicProfile(userId: number): Observable<ApiResponse<BusinessPublicProfile>> {
    return this.http.post<ApiResponse<BusinessPublicProfile>>(
      `${this.apiConfig.getAdminBusinessUrl()}/getPublicProfile`, { userId });
  }

  updatePublicProfile(payload: UpdateBusinessProfilePayload): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.apiConfig.getAdminBusinessUrl()}/updatePublicProfile`, payload);
  }
}
