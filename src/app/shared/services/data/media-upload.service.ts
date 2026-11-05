import { Injectable, inject } from '@angular/core';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { ApiConfigService } from '../api/api-config.service';

export type UploadType = 'category' | 'ad' | 'profile' | 'business_logo' | 'business_cover';

export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif'] as const;
/** 5 MB — per Postman `/media/upload-url` documentation. */
export const MAX_IMAGE_FILE_SIZE = 5_242_880;

export interface UploadUrlData {
  uploadUrl: string;
  storageKey: string;
  expiresAt: string;
}

interface ApiResponse<T> {
  message: string;
  status: string;
  data: T;
}

export type ImageValidationError = 'invalid_type' | 'too_large';

@Injectable({
  providedIn: 'root',
})
export class MediaUploadService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(ApiConfigService);

  /**
   * A client built directly on HttpBackend so NO interceptors run:
   * the R2 presigned PUT must not carry the app Bearer token or cookies.
   */
  private readonly unauthenticatedHttp = new HttpClient(inject(HttpBackend));

  validateImageFile(file: File): ImageValidationError | null {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
      return 'invalid_type';
    }
    if (file.size > MAX_IMAGE_FILE_SIZE) {
      return 'too_large';
    }
    return null;
  }

  /** Step 1: ask the API for a presigned R2 URL (authenticated, normal client). */
  requestUploadUrl(type: UploadType, contentType: string, fileSize: number): Observable<UploadUrlData> {
    return this.http
      .post<ApiResponse<UploadUrlData>>(`${this.apiConfig.getMediaUrl()}/upload-url`, {
        type,
        contentType,
        fileSize,
      })
      .pipe(map((res) => res.data));
  }

  /**
   * Step 2: PUT the raw file bytes to the presigned URL.
   * - No Authorization header, no cookies (interceptor-free client).
   * - Same Content-Type used when requesting the URL.
   * - The signed URL is used exactly as returned.
   */
  putToSignedUrl(uploadUrl: string, file: File): Observable<void> {
    return this.unauthenticatedHttp.put(uploadUrl, file, {
      headers: new HttpHeaders({ 'Content-Type': file.type }),
      withCredentials: false,
      responseType: 'text',
    }).pipe(map(() => void 0));
  }

  /**
   * Full flow: request URL → PUT file → emit the storageKey only after
   * the PUT succeeds. Nothing is emitted (and the observable errors) when
   * the upload fails, so callers never receive a key for a missing object.
   */
  uploadImage(type: UploadType, file: File): Observable<string> {
    return this.requestUploadUrl(type, file.type, file.size).pipe(
      switchMap((data) =>
        this.putToSignedUrl(data.uploadUrl, file).pipe(map(() => data.storageKey))
      )
    );
  }
}
