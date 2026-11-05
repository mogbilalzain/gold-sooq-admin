import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { IdentityService } from './identity.service';

describe('IdentityService (exact field names per Postman contract)', () => {
  let service: IdentityService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(IdentityService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list sends page/limit/status/userId', () => {
    service.list({ page: 2, limit: 20, status: 'pending', userId: 42 }).subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/identity/list'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ page: 2, limit: 20, status: 'pending', userId: 42 });
    req.flush({ status: 'success', message: '', data: { requests: [], pagination: { total: 0, totalPages: 0 } } });
  });

  it('getById sends requestId', () => {
    service.getById(7).subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/identity/getById'));
    expect(req.request.body).toEqual({ requestId: 7 });
    req.flush({ status: 'success', message: '', data: { request: { id: 7 } } });
  });

  it('approve sends the from-document fields (not the user input)', () => {
    service.approve({
      requestId: 7,
      idNumberFromDocument: '784199012345671',
      idExpiryDateFromDocument: '2028-12-31',
      internalNote: 'verified against card',
    }).subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/identity/approve'));
    expect(req.request.body).toEqual({
      requestId: 7,
      idNumberFromDocument: '784199012345671',
      idExpiryDateFromDocument: '2028-12-31',
      internalNote: 'verified against card',
    });
    req.flush({ status: 'success', message: '', data: {} });
  });

  it('requestMoreInfo sends reasonCode/userMessage/missingItems/internalNote', () => {
    service.requestMoreInfo({
      requestId: 7,
      reasonCode: 'id_front_unreadable',
      userMessage: 'أعد التصوير',
      missingItems: ['id_front'],
      internalNote: 'glare',
    }).subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/identity/requestMoreInfo'));
    expect(req.request.body).toEqual({
      requestId: 7,
      reasonCode: 'id_front_unreadable',
      userMessage: 'أعد التصوير',
      missingItems: ['id_front'],
      internalNote: 'glare',
    });
    req.flush({ status: 'success', message: '', data: {} });
  });

  it('reject sends reasonCode/userMessage/internalNote', () => {
    service.reject({ requestId: 7, reasonCode: 'document_tampered', userMessage: 'مرفوض', internalNote: 'edited' }).subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/identity/reject'));
    expect(req.request.body).toEqual({
      requestId: 7,
      reasonCode: 'document_tampered',
      userMessage: 'مرفوض',
      internalNote: 'edited',
    });
    req.flush({ status: 'success', message: '', data: {} });
  });

  it('revoke targets the userId (not the requestId)', () => {
    service.revoke({ userId: 99, reasonCode: 'policy_violation', internalNote: 'abuse' }).subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/identity/revoke'));
    expect(req.request.body).toEqual({ userId: 99, reasonCode: 'policy_violation', internalNote: 'abuse' });
    req.flush({ status: 'success', message: '', data: {} });
  });
});
