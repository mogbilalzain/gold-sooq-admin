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
  status?: 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'deleted' | 'all';
  categoryId?: number;
  countryId?: number;
  dateFrom?: string;
  dateTo?: string;
}

/** Shape returned by the backend list endpoint */
export interface PostAd {
  id: number;
  post_title: string;
  price?: number;
  /** 'fixed' | 'market' | 'contact' (missing on legacy ads → treat as fixed) */
  price_type?: string;
  create_date?: string;
  /** Backend sends "0" or "1" as a string */
  is_active: string;
  /** 0 or 1 */
  is_featured: number;
  user_account_id?: number;
  /** "pending" | "approved" | "rejected" */
  review_status?: string;
  reject_reason?: string | null;
  reviewed_by?: number | null;
  reviewed_at?: number | null;
  main_image_url?: string;
  currency?: string;
  stateName?: string;
  countryName?: string;
  categoryName?: string;
  user_name?: string;
  user_email?: string;
  images?: { id: number; url: string; filename: string }[];
  // Seller info (new)
  sellerType?: 'individual' | 'business' | string;
  accountType?: 'individual' | 'business' | null;
  /** 0/1 or "0"/"1" — normalize with toFlag() before use */
  isIdentityVerified?: number | string | boolean;
  isBusinessVerified?: number | string | boolean;
  tradeName?: string | null;
  logoUrl?: string | null;
}

/** Full details payload of /admin/posts-ads/getById */
export interface PostAdDetails extends PostAd {
  post_detail?: string;
  address_line?: string;
  categoryId?: number;
  parentCategoryId?: number;
  parentCategoryName?: string;
  attributes?: { name: string; value: string; unit?: string | null }[];
  post_end_date?: string | null;
  inactive_reason?: string | null;
  deleted_at?: string | null;
  userId?: number;
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  userProfileImageUrl?: string | null;
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

export interface ApprovePostRequest {
  postAdsId: number;
}

export interface RejectPostRequest {
  postAdsId: number;
  reason: string;
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

  getPostById(postAdsId: number, langCode: 'en' | 'ar'): Observable<ApiResponse<PostAdDetails>> {
    return this.http.post<ApiResponse<PostAdDetails>>(
      `${this.apiConfig.getAdminPostsAdsUrl()}/getById`,
      { postAdsId, langCode }
    );
  }

  updatePost(request: UpdatePostRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiConfig.getAdminPostsAdsUrl()}/update`,
      request
    );
  }

  deletePost(request: DeletePostRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiConfig.getAdminPostsAdsUrl()}/delete`,
      request
    );
  }

  approvePost(request: ApprovePostRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiConfig.getAdminPostsAdsUrl()}/approve`,
      request
    );
  }

  rejectPost(request: RejectPostRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiConfig.getAdminPostsAdsUrl()}/reject`,
      request
    );
  }
}
