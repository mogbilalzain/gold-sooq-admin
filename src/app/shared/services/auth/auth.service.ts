import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ApiConfigService } from '../api/api-config.service';
import { TokenStorageService } from './token-storage.service';
import { ErrorHandlerService } from '../api/error-handler.service';

export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  fullName: string;
  phoneNumber: string;
  role: string;
  token: string;
}

export interface ChangePasswordRequest {
  phoneNumber: string;
  currentPassword: string;
  newPassword: string;
}

export interface SendOTPRequest {
  phoneNumber: string;
}

export interface ResetPasswordRequest {
  phoneNumber: string;
  otpCode: number;
  newPassword: string;
}

export interface ApiResponse<T> {
  message: string;
  status: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private tokenStorage: TokenStorageService,
    private errorHandler: ErrorHandlerService,
    private router: Router
  ) {
    // Load user from storage on init
    const user = this.tokenStorage.getUser();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.apiConfig.getAdminAuthUrl()}/signin`,
      credentials
    ).pipe(
      tap(response => {
        if (response.status === 'success' && response.data) {
          this.tokenStorage.saveToken(response.data.token);
          this.tokenStorage.saveUser(response.data);
          this.currentUserSubject.next(response.data);
        }
      })
    );
  }

  logout(): void {
    this.tokenStorage.clear();
    this.currentUserSubject.next(null);
    this.router.navigate(['/signin']);
  }

  changePassword(data: ChangePasswordRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.apiConfig.getAdminAuthUrl()}/changePassword`,
      data
    ).pipe(
      tap(response => {
        if (response.status === 'success' && response.data) {
          this.tokenStorage.saveToken(response.data.token);
          this.tokenStorage.saveUser(response.data);
          this.currentUserSubject.next(response.data);
        }
      })
    );
  }

  sendOTP(data: SendOTPRequest): Observable<ApiResponse<{ sendOtpResult: boolean }>> {
    return this.http.post<ApiResponse<{ sendOtpResult: boolean }>>(
      `${this.apiConfig.getAdminAuthUrl()}/restPassword/sendOTP`,
      data
    );
  }

  resetPassword(data: ResetPasswordRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.apiConfig.getAdminAuthUrl()}/restPassword/verifyToRestPassword`,
      data
    ).pipe(
      tap(response => {
        if (response.status === 'success' && response.data) {
          this.tokenStorage.saveToken(response.data.token);
          this.tokenStorage.saveUser(response.data);
          this.currentUserSubject.next(response.data);
        }
      })
    );
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value || this.tokenStorage.getUser();
  }

  isAuthenticated(): boolean {
    return this.tokenStorage.isAuthenticated();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }
}

