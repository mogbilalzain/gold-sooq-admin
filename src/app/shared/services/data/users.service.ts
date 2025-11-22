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
}

export interface User {
  id: number;
  full_name: string;
  phone_number: string;
  email?: string;
  verified: number; // 1 for verified, 0 for not verified
  status: string; // "active" or "inactive"
  role: string;
  created_at?: string;
  updated_at?: string;
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

  deleteUser(request: DeleteUserRequest): Observable<ApiResponse<{ deleted: boolean }>> {
    return this.http.post<ApiResponse<{ deleted: boolean }>>(
      `${this.apiConfig.getAdminUsersUrl()}/delete`,
      request
    );
  }
}

