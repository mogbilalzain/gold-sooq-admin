import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UsersService } from './users.service';

describe('UsersService (public profile endpoints)', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getPublicProfile sends userId and langCode', () => {
    service.getPublicProfile(17, 'ar').subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/users/getPublicProfile'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ userId: 17, langCode: 'ar' });
    req.flush({ status: 'success', message: '', data: { userId: 17, sellerType: 'individual' } });
  });

  it('getAccountPublicPage uses the exact countryID casing', () => {
    service.getAccountPublicPage(17, 'en', 1).subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/users/getAccountPublicPage'));
    const body = req.request.body as Record<string, unknown>;
    expect(body['userId']).toBe(17);
    expect(body['langCode']).toBe('en');
    expect(body['countryID']).toBe(1);
    expect('countryId' in body).toBeFalse();
    req.flush({ status: 'success', message: '', data: { profile: {}, ads: [] } });
  });

  it('listUsers passes accountType and identityStatus filters through', () => {
    service.listUsers({ page: 1, limit: 20, accountType: 'business', identityStatus: 'verified' }).subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/users/list'));
    expect(req.request.body['accountType']).toBe('business');
    expect(req.request.body['identityStatus']).toBe('verified');
    req.flush({ status: 'success', message: '', data: { users: [], pagination: { total: 0, totalPages: 0 } } });
  });
});
