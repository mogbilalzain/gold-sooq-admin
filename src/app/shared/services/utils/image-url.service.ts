import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageUrlService {
  private readonly imageBaseUrl = 'https://ashieari.com/images/';

  /**
   * إضافة رابط الصور الأساسي للصور القادمة من الباك اند
   * @param imageUrl - رابط الصورة من الباك اند
   * @returns رابط الصورة الكامل
   */
  getImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) {
      return '';
    }

    // إذا كان الرابط يبدأ بـ http:// أو https://، إرجاعه كما هو
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // إذا كان الرابط يبدأ بـ /، إزالة الـ / الأول
    const cleanUrl = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;

    // إضافة الرابط الأساسي
    return `${this.imageBaseUrl}${cleanUrl}`;
  }

  /**
   * التحقق من وجود رابط صورة
   */
  hasImage(imageUrl: string | null | undefined): boolean {
    return !!imageUrl && imageUrl.trim() !== '';
  }
}

