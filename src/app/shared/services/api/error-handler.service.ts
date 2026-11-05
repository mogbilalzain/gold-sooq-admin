import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface ApiError {
  status: number;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  private isArabic(): boolean {
    if (typeof document === 'undefined') return true;
    const lang = document.documentElement.getAttribute('lang') || 'ar';
    return lang === 'ar';
  }

  private fallbackMessage(status: number): string {
    const ar = this.isArabic();
    switch (status) {
      case 400:
        return ar ? 'طلب غير صحيح' : 'Bad request';
      case 401:
        return ar ? 'غير مصرح - يرجى تسجيل الدخول' : 'Unauthorized — please sign in';
      case 403:
        return ar ? 'غير مصرح - تحتاج صلاحيات المدير' : 'Forbidden — admin privileges required';
      case 404:
        return ar ? 'المورد غير موجود' : 'Resource not found';
      case 500:
        return ar ? 'خطأ في الخادم' : 'Server error';
      default:
        return ar ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred';
    }
  }

  handleError(error: HttpErrorResponse): ApiError {
    let errorMessage = this.fallbackMessage(500);
    let status = 500;

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      status = error.status || 500;

      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error && typeof error.error === 'string') {
        errorMessage = error.error;
      } else {
        errorMessage = this.fallbackMessage(status);
      }
    }

    return {
      status,
      message: errorMessage,
      data: error.error?.data || null
    };
  }

  getErrorMessage(error: HttpErrorResponse): string {
    return this.handleError(error).message;
  }
}
