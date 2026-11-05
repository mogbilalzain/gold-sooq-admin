import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(NotificationsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('listNotifications sends page and limit', () => {
    service.listNotifications({ page: 2, limit: 20 }).subscribe();

    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/notifications/listNotifications'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('20');
    req.flush({
      status: 'success',
      message: 'success',
      data: { notifications: [], pagination: { page: 2, limit: 20, total: 21, totalPages: 2 } },
    });
  });

  it('listNotifications without arguments lets the server use its defaults', () => {
    service.listNotifications().subscribe();

    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/notifications/listNotifications'));
    expect(req.request.params.keys()).toEqual([]);
    req.flush({
      status: 'success',
      message: 'success',
      data: { notifications: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
    });
  });
});
