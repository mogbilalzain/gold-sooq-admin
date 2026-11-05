import { Injectable } from '@angular/core';

/**
 * Image URLs come back from the API as complete CDN URLs
 * (https://cdn.ayarsouq.com/...) — they are used directly.
 * This service is kept as a pass-through for existing callers;
 * no prefixing is performed anymore.
 */
@Injectable({
  providedIn: 'root'
})
export class ImageUrlService {
  getImageUrl(imageUrl: string | null | undefined): string {
    return imageUrl ?? '';
  }

  hasImage(imageUrl: string | null | undefined): boolean {
    return !!imageUrl && imageUrl.trim() !== '';
  }
}
