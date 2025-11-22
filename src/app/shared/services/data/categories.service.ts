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
  image_url?: string;
  parent_category_id?: number;
  createdAt?: string;
  updatedAt?: string;
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
  image_url?: string;
  parent_category_id?: number;
}

export interface UpdateCategoryRequest {
  categoryId: number;
  name_en?: string;
  name_ar?: string;
  image_url?: string;
  parent_category_id?: number;
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

  createCategory(request: CreateCategoryRequest): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(
      `${this.apiConfig.getAdminCategoriesUrl()}/create`,
      request
    );
  }

  updateCategory(request: UpdateCategoryRequest): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(
      `${this.apiConfig.getAdminCategoriesUrl()}/update`,
      request
    );
  }

  deleteCategory(request: DeleteCategoryRequest): Observable<ApiResponse<{ deleted: boolean }>> {
    return this.http.post<ApiResponse<{ deleted: boolean }>>(
      `${this.apiConfig.getAdminCategoriesUrl()}/delete`,
      request
    );
  }

  uploadCategoryImage(categoryId: number, file: File): Observable<ApiResponse<{ image_url: string }>> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('categoryId', categoryId.toString());

    return this.http.post<ApiResponse<{ image_url: string }>>(
      `${this.apiConfig.getAdminCategoriesUrl()}/uploadImage`,
      formData
    );
  }
}

