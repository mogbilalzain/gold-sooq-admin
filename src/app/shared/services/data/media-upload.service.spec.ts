import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { MediaUploadService } from './media-upload.service';

describe('MediaUploadService', () => {
  let service: MediaUploadService;
  let httpMock: HttpTestingController;

  const pngFile = new File(['fake-bytes'], 'photo.png', { type: 'image/png' });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MediaUploadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests an upload URL with the exact contract fields', () => {
    service.requestUploadUrl('category', 'image/png', 123).subscribe();

    const req = httpMock.expectOne((r) => r.url.endsWith('/media/upload-url'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      type: 'category',
      contentType: 'image/png',
      fileSize: 123,
    });
    req.flush({ status: 'success', message: '', data: { uploadUrl: 'https://r2.example/signed', storageKey: 'categories/1.png', expiresAt: 'x' } });
  });

  it('PUTs the raw file to the signed URL with matching Content-Type and no Authorization header', () => {
    service.putToSignedUrl('https://r2.example/signed', pngFile).subscribe();

    const req = httpMock.expectOne('https://r2.example/signed');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toBe(pngFile);
    expect(req.request.headers.get('Content-Type')).toBe('image/png');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    expect(req.request.withCredentials).toBeFalse();
    req.flush('');
  });

  it('emits the storageKey only after the PUT succeeds', () => {
    const emitted: string[] = [];
    service.uploadImage('business_logo', pngFile).subscribe((key) => emitted.push(key));

    const urlReq = httpMock.expectOne((r) => r.url.endsWith('/media/upload-url'));
    urlReq.flush({
      status: 'success',
      message: '',
      data: { uploadUrl: 'https://r2.example/signed', storageKey: 'logos/9.png', expiresAt: 'x' },
    });
    // No key before the PUT completes.
    expect(emitted.length).toBe(0);

    const putReq = httpMock.expectOne('https://r2.example/signed');
    putReq.flush('');
    expect(emitted).toEqual(['logos/9.png']);
  });

  it('errors without emitting a key when the PUT fails (no create/update can follow)', () => {
    const emitted: string[] = [];
    let failed = false;
    service.uploadImage('category', pngFile).subscribe({
      next: (key) => emitted.push(key),
      error: () => (failed = true),
    });

    const urlReq = httpMock.expectOne((r) => r.url.endsWith('/media/upload-url'));
    urlReq.flush({
      status: 'success',
      message: '',
      data: { uploadUrl: 'https://r2.example/signed', storageKey: 'k', expiresAt: 'x' },
    });

    const putReq = httpMock.expectOne('https://r2.example/signed');
    putReq.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(failed).toBeTrue();
    expect(emitted.length).toBe(0);
  });

  it('never issues the PUT when the upload-url request fails', () => {
    let failed = false;
    service.uploadImage('category', pngFile).subscribe({ error: () => (failed = true) });

    const urlReq = httpMock.expectOne((r) => r.url.endsWith('/media/upload-url'));
    urlReq.flush('Server error', { status: 500, statusText: 'Server Error' });

    httpMock.expectNone('https://r2.example/signed');
    expect(failed).toBeTrue();
  });

  it('validates file type and size', () => {
    expect(service.validateImageFile(pngFile)).toBeNull();
    expect(service.validateImageFile(new File(['x'], 'a.txt', { type: 'text/plain' }))).toBe('invalid_type');
    const big = new File([new Uint8Array(5_242_881)], 'big.png', { type: 'image/png' });
    expect(service.validateImageFile(big)).toBe('too_large');
  });
});
