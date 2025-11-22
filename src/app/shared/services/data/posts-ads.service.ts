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

export interface ListPostsRequest {
  page?: number;
  limit?: number;
  langCode: 'en' | 'ar';
  status?: 'active' | 'inactive' | 'all';
  categoryId?: number;
  countryId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface PostAd {
  id: number;
  postTitle: string;
  postDetail: string;
  price?: number;
  isActive: boolean;
  isFeatured: boolean;
  images?: string[];
  categoryId?: number;
  userId?: number;
  countryId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PostsListResponse {
  posts: PostAd[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdatePostRequest {
  postAdsId: number;
  postTitle?: string;
  postDetail?: string;
  price?: number;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface DeletePostRequest {
  postAdsId: number;
}

@Injectable({
  providedIn: 'root'
})
export class PostsAdsService {

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private errorHandler: ErrorHandlerService
  ) {}

  listPosts(request: ListPostsRequest): Observable<ApiResponse<PostsListResponse>> {
    return this.http.post<ApiResponse<PostsListResponse>>(
      `${this.apiConfig.getAdminPostsAdsUrl()}/list`,
      request
    );
  }

  updatePost(request: UpdatePostRequest): Observable<ApiResponse<PostAd>> {
    return this.http.post<ApiResponse<PostAd>>(
      `${this.apiConfig.getAdminPostsAdsUrl()}/update`,
      request
    );
  }

  deletePost(request: DeletePostRequest): Observable<ApiResponse<{ deleted: boolean }>> {
    return this.http.post<ApiResponse<{ deleted: boolean }>>(
      `${this.apiConfig.getAdminPostsAdsUrl()}/delete`,
      request
    );
  }
}

