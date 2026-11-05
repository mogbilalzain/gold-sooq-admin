import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { BusinessService } from './business.service';

describe('BusinessService (exact field names per Postman contract)', () => {
  let service: BusinessService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BusinessService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list sends the filters including authorityCode', () => {
    service.list({ page: 1, limit: 20, status: 'pending', authorityCode: 'DED_DUBAI', userId: 5 }).subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/business/list'));
    expect(req.request.body).toEqual({ page: 1, limit: 20, status: 'pending', authorityCode: 'DED_DUBAI', userId: 5 });
    req.flush({ status: 'success', message: '', data: { requests: [], pagination: { total: 0, totalPages: 0 } } });
  });

  it('checkLicense sends authorityCode/authorityName/licenseNumber', () => {
    service.checkLicense({ authorityCode: 'OTHER_FREEZONE', authorityName: 'My Free Zone', licenseNumber: '1234567' }).subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/business/checkLicense'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      authorityCode: 'OTHER_FREEZONE',
      authorityName: 'My Free Zone',
      licenseNumber: '1234567',
    });
    req.flush({ status: 'success', message: '', data: { authorityKey: 'OTHER_FREEZONE:my free zone', normalizedNumber: '1234567', claimed: false, claimedUserId: null } });
  });

  it('approve sends all from-document and confirmed fields', () => {
    service.approve({
      requestId: 3,
      legalNameFromDocument: 'Golden Jewellery LLC',
      licenseNumberFromDocument: '1234567',
      authorityCodeFromDocument: 'DED_DUBAI',
      authorityNameFromDocument: null,
      licenseExpiryDateFromDocument: '2027-12-31',
      tradeNameConfirmed: 'Golden Jewellery',
      businessKindConfirmed: 'store',
      activityTypeConfirmed: 'jewelry_store',
      emirateStateIdConfirmed: 2,
      internalNote: 'verified',
    }).subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/business/approve'));
    expect(req.request.body).toEqual({
      requestId: 3,
      legalNameFromDocument: 'Golden Jewellery LLC',
      licenseNumberFromDocument: '1234567',
      authorityCodeFromDocument: 'DED_DUBAI',
      authorityNameFromDocument: null,
      licenseExpiryDateFromDocument: '2027-12-31',
      tradeNameConfirmed: 'Golden Jewellery',
      businessKindConfirmed: 'store',
      activityTypeConfirmed: 'jewelry_store',
      emirateStateIdConfirmed: 2,
      internalNote: 'verified',
    });
    req.flush({ status: 'success', message: '', data: {} });
  });

  it('revoke targets the userId', () => {
    service.revoke({ userId: 12, reasonCode: 'policy_violation', internalNote: 'audit' }).subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/business/revoke'));
    expect(req.request.body).toEqual({ userId: 12, reasonCode: 'policy_violation', internalNote: 'audit' });
    req.flush({ status: 'success', message: '', data: {} });
  });

  it('updatePublicProfile passes partial payloads through, keeping explicit nulls', () => {
    service.updatePublicProfile({
      userId: 8,
      tradeName: 'New Name',
      logoStorageKey: null,
      socialLinks: [{ platform: 'instagram', url: 'https://instagram.com/x' }],
    }).subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/business/updatePublicProfile'));
    const body = req.request.body as Record<string, unknown>;
    expect(body['userId']).toBe(8);
    expect(body['tradeName']).toBe('New Name');
    // Explicit null must survive serialization — it clears the logo.
    expect('logoStorageKey' in body).toBeTrue();
    expect(body['logoStorageKey']).toBeNull();
    expect(body['socialLinks']).toEqual([{ platform: 'instagram', url: 'https://instagram.com/x' }]);
    // Untouched fields must not be present.
    expect('description' in body).toBeFalse();
    expect('coverStorageKey' in body).toBeFalse();
    req.flush({ status: 'success', message: '', data: {} });
  });

  it('getPublicProfile sends userId only', () => {
    service.getPublicProfile(8).subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/business/getPublicProfile'));
    expect(req.request.body).toEqual({ userId: 8 });
    req.flush({ status: 'success', message: '', data: { userId: 8, profileStatus: 'verified' } });
  });
});
