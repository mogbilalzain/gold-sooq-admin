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

export interface ListUsersRequest {
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive' | 'all';
  verified?: boolean;
  searchTerm?: string;
  accountType?: 'individual' | 'business' | 'all';
  identityStatus?: 'unverified' | 'verified' | 'expired' | 'revoked' | 'all';
}

export type IdentityStatus = 'unverified' | 'verified' | 'expired' | 'revoked';
export type BusinessProfileStatus = 'unverified' | 'verified' | 'expired' | 'revoked';

export interface User {
  id: number;
  full_name: string;
  phone_number: string;
  email?: string;
  verified: number; // 1 for verified, 0 for not verified (phone)
  status: string; // "active" or "inactive"
  role: string;
  created_at?: string;
  updated_at?: string;
  /** May be null for pre-migration accounts — treat null as individual. */
  account_type?: 'individual' | 'business' | null;
  identity_status?: IdentityStatus;
  identity_expires_on?: string | null;
  /** Computed flags — normalize with toFlag() before use. */
  isIdentityVerified?: number | string | boolean;
  isBusinessVerified?: number | string | boolean;
  sellerType?: 'individual' | 'business';
  tradeName?: string | null;
  businessProfileStatus?: BusinessProfileStatus | null;
  profile_image_storage_key?: string | null;
}

/** Public profile (admin view) — shape varies by sellerType. */
export interface UserPublicProfile {
  userId: number;
  banned?: boolean | number;
  status?: string;
  identityStatus?: IdentityStatus;
  identityExpiresOn?: string | null;
  accountType?: 'individual' | 'business' | null;
  email?: string;
  sellerType: 'individual' | 'business';
  displayName?: string;
  ownerName?: string;
  phoneNumber?: string;
  avatarUrl?: string | null;
  isIdentityVerified?: number | string | boolean;
  isBusinessVerified?: number | string | boolean;
  // Business fields (privileged profile)
  tradeName?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  businessKind?: string;
  activityType?: string;
  description?: string;
  addressLine?: string;
  contactPhone?: string;
  contactEmail?: string;
  websiteUrl?: string;
  socialLinks?: { platform: string; url: string }[];
  workingHours?: { day: string; open: string; close: string; closed: boolean }[];
}

export interface AccountPublicPage {
  profile: UserPublicProfile;
  ads: import('./posts-ads.service').PostAd[];
}

export interface UsersListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateUserRequest {
  userId: number;
  fullName?: string;
  email?: string;
  phoneNumber?: number;
  verified?: boolean;
  status?: 'active' | 'inactive';
}

export interface UpdateUserResponse {
  userId: number;
}

export interface DeleteUserRequest {
  userId: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private errorHandler: ErrorHandlerService
  ) {}

  listUsers(request: ListUsersRequest): Observable<ApiResponse<UsersListResponse>> {
    return this.http.post<ApiResponse<UsersListResponse>>(
      `${this.apiConfig.getAdminUsersUrl()}/list`,
      request
    );
  }

  updateUser(request: UpdateUserRequest): Observable<ApiResponse<UpdateUserResponse>> {
    return this.http.post<ApiResponse<UpdateUserResponse>>(
      `${this.apiConfig.getAdminUsersUrl()}/update`,
      request
    );
  }

  /** Backend returns only the id: { userId } (hard delete). */
  deleteUser(request: DeleteUserRequest): Observable<ApiResponse<{ userId: number }>> {
    return this.http.post<ApiResponse<{ userId: number }>>(
      `${this.apiConfig.getAdminUsersUrl()}/delete`,
      request
    );
  }

  /** Admin can view banned users too. Never includes KYC notes/documents. */
  getPublicProfile(userId: number, langCode: 'en' | 'ar'): Observable<ApiResponse<UserPublicProfile>> {
    return this.http.post<ApiResponse<UserPublicProfile>>(
      `${this.apiConfig.getAdminUsersUrl()}/getPublicProfile`,
      { userId, langCode }
    );
  }

  /**
   * Profile + the user's ACTIVE APPROVED ads (not every ad — use the admin
   * ads listing for broader inspection). Note the exact `countryID` casing.
   */
  getAccountPublicPage(userId: number, langCode: 'en' | 'ar', countryID: number): Observable<ApiResponse<AccountPublicPage>> {
    return this.http.post<ApiResponse<AccountPublicPage>>(
      `${this.apiConfig.getAdminUsersUrl()}/getAccountPublicPage`,
      { userId, langCode, countryID }
    );
  }
}

