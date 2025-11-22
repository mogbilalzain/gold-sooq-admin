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
  
  handleError(error: HttpErrorResponse): ApiError {
    let errorMessage = 'حدث خطأ غير متوقع';
    let status = 500;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      status = error.status || 500;
      
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error && typeof error.error === 'string') {
        errorMessage = error.error;
      } else {
        switch (error.status) {
          case 400:
            errorMessage = 'طلب غير صحيح';
            break;
          case 401:
            errorMessage = 'غير مصرح - يرجى تسجيل الدخول';
            break;
          case 403:
            errorMessage = 'غير مصرح - تحتاج صلاحيات المدير';
            break;
          case 404:
            errorMessage = 'المورد غير موجود';
            break;
          case 500:
            errorMessage = 'خطأ في الخادم';
            break;
          default:
            errorMessage = 'حدث خطأ غير متوقع';
        }
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

