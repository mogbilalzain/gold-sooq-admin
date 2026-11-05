import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../api/api-config.service';
import { ErrorHandlerService, ApiError } from '../api/error-handler.service';

export interface ApiResponse<T> {
  message: string;
  status: string;
  data: T;
}

export interface ListCategoriesRequest {
  page?: number;
  limit?: number;
  langCode: 'en' | 'ar';
}

export interface Category {
  id: number;
  name_en: string;
  name_ar: string;
  name?: string;
  image_url?: string;
  parent_category_id?: number | null;
  created_at?: string;
  updated_at?: string;
  subCategories?: Category[];
}

export interface CategoriesListResponse {
  categories: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateCategoryRequest {
  name_en: string;
  name_ar: string;
  /** R2 storage key from /media/upload-url (omit for no image) */
  image_storage_key?: string;
  parent_category_id?: number | null;
}

export interface UpdateCategoryRequest {
  categoryId: number;
  name_en?: string;
  name_ar?: string;
  /** Omit when the image is unchanged */
  image_storage_key?: string;
  parent_category_id?: number | null;
}

export interface DeleteCategoryRequest {
  categoryId: number;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private errorHandler: ErrorHandlerService
  ) {}

  listCategories(request: ListCategoriesRequest): Observable<ApiResponse<CategoriesListResponse>> {
    return this.http.post<ApiResponse<CategoriesListResponse>>(
      `${this.apiConfig.getAdminCategoriesUrl()}/list`,
      request
    );
  }

  /** Backend returns only the new id: { categoryId }. */
  createCategory(request: CreateCategoryRequest): Observable<ApiResponse<{ categoryId: number }>> {
    return this.http.post<ApiResponse<{ categoryId: number }>>(
      `${this.apiConfig.getAdminCategoriesUrl()}/create`,
      request
    );
  }

  /** Backend returns only the id: { categoryId }. */
  updateCategory(request: UpdateCategoryRequest): Observable<ApiResponse<{ categoryId: number }>> {
    return this.http.post<ApiResponse<{ categoryId: number }>>(
      `${this.apiConfig.getAdminCategoriesUrl()}/update`,
      request
    );
  }

  /** Backend returns only the id: { categoryId } (hard delete). */
  deleteCategory(request: DeleteCategoryRequest): Observable<ApiResponse<{ categoryId: number }>> {
    return this.http.post<ApiResponse<{ categoryId: number }>>(
      `${this.apiConfig.getAdminCategoriesUrl()}/delete`,
      request
    );
  }

  // Image uploads go through MediaUploadService (presigned R2 flow):
  // POST /media/upload-url → PUT file to signed URL → storageKey passed as
  // image_storage_key in create/update.
}

