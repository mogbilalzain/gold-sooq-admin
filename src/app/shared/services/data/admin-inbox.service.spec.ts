import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router, provideRouter } from '@angular/router';
import {
  ADMIN_INBOX_NOTIFICATION_API,
  ADMIN_INBOX_SOCKET_FACTORY,
  ADMIN_NOTIFICATION_EVENT,
  AdminInboxItem,
  AdminInboxService,
  DESKTOP_ALERTS_STORAGE_KEY,
} from './admin-inbox.service';
import { TokenStorageService } from '../auth/token-storage.service';

class FakeNotification {
  static permission: NotificationPermission = 'granted';
  static requestPermission = jasmine.createSpy('requestPermission');
  static instances: FakeNotification[] = [];
  onclick: (() => void) | null = null;
  close = jasmine.createSpy('close');
  constructor(public title: string, public options: NotificationOptions) {
    FakeNotification.instances.push(this);
  }
}

function item(id: number, overrides: Partial<AdminInboxItem> = {}): AdminInboxItem {
  return {
    id,
    type: 'contact_message',
    entity_id: 100 + id,
    title_ar: 'رسالة تواصل جديدة',
    title_en: 'New contact message',
    message_ar: 'x',
    message_en: 'x',
    is_read: 0,
    created_at: 1700000000000,
    ...overrides,
  };
}

describe('AdminInboxService', () => {
  let service: AdminInboxService;
  let httpMock: HttpTestingController;
  let handlers: Record<string, (payload: unknown) => void>;
  let fakeSocket: { on: jasmine.Spy; disconnect: jasmine.Spy };
  let factory: jasmine.Spy;

  beforeEach(() => {
    handlers = {};
    fakeSocket = {
      on: jasmine.createSpy('on').and.callFake((event: string, cb: (payload: unknown) => void) => {
        handlers[event] = cb;
      }),
      disconnect: jasmine.createSpy('disconnect'),
    };
    factory = jasmine.createSpy('socketFactory').and.returnValue(fakeSocket);
    FakeNotification.permission = 'granted';
    FakeNotification.instances = [];
    FakeNotification.requestPermission.calls.reset();
    localStorage.removeItem(DESKTOP_ALERTS_STORAGE_KEY);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ADMIN_INBOX_SOCKET_FACTORY, useValue: factory },
        { provide: ADMIN_INBOX_NOTIFICATION_API, useValue: FakeNotification },
        { provide: TokenStorageService, useValue: { getToken: () => 'jwt-token' } },
      ],
    });
    service = TestBed.inject(AdminInboxService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem(DESKTOP_ALERTS_STORAGE_KEY);
  });

  function startWith(items: AdminInboxItem[], unreadCount: number) {
    service.start();
    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/inbox'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('limit')).toBe('20');
    req.flush({ status: 'success', message: 'success', data: { items, unreadCount } });
  }

  it('start loads the first page and connects with the token over websocket', () => {
    startWith([item(2), item(1, { is_read: 1 })], 1);

    expect(service.items().map((i) => i.id)).toEqual([2, 1]);
    expect(service.unreadCount()).toBe(1);
    const [url, opts] = factory.calls.mostRecent().args;
    expect(url).not.toContain('/AyarSouqAPIs');
    expect(opts).toEqual({ auth: { token: 'jwt-token' }, transports: ['websocket'] });
  });

  it('a live socket event is prepended and bumps the unread count once', () => {
    startWith([item(1)], 1);

    handlers[ADMIN_NOTIFICATION_EVENT](item(5));
    handlers[ADMIN_NOTIFICATION_EVENT](item(5));

    expect(service.items().map((i) => i.id)).toEqual([5, 1]);
    expect(service.unreadCount()).toBe(2);
  });

  it('markRead patches one item and takes the server unread count', () => {
    startWith([item(2), item(1)], 2);

    service.markRead(service.items()[0]).subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/inbox/2/read'));
    expect(req.request.method).toBe('PATCH');
    req.flush({ status: 'success', message: 'success', data: { id: 2, unreadCount: 1 } });

    expect(service.items()[0].is_read).toBe(1);
    expect(service.items()[1].is_read).toBe(0);
    expect(service.unreadCount()).toBe(1);
  });

  it('markAllRead clears the unread count and marks every item read', () => {
    startWith([item(2), item(1)], 2);

    service.markAllRead().subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/inbox/read-all'));
    expect(req.request.method).toBe('PATCH');
    req.flush({ status: 'success', message: 'success', data: { updated: 2, unreadCount: 0 } });

    expect(service.unreadCount()).toBe(0);
    expect(service.items().every((i) => i.is_read === 1)).toBeTrue();
  });

  it('loadMore requests items older than the last loaded id', () => {
    startWith(Array.from({ length: 20 }, (_, n) => item(40 - n)), 0);
    expect(service.hasMore()).toBeTrue();

    service.loadMore();
    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/inbox'));
    expect(req.request.params.get('beforeId')).toBe('21');
    req.flush({ status: 'success', message: 'success', data: { items: [item(3)], unreadCount: 0 } });

    expect(service.items().length).toBe(21);
    expect(service.hasMore()).toBeFalse();
  });

  it('routeFor maps each type to its details page', () => {
    expect(service.routeFor(item(1, { type: 'new_ad_pending', entity_id: 9 }))).toEqual(['/posts-ads', '9']);
    expect(service.routeFor(item(1, { type: 'identity_submitted', entity_id: 9 }))).toEqual(['/identity-requests', '9']);
    expect(service.routeFor(item(1, { type: 'business_submitted', entity_id: 9 }))).toEqual(['/business-requests', '9']);
    expect(service.routeFor(item(1, { type: 'contact_message', entity_id: 9 }))).toEqual(['/contact-messages', '9']);
  });

  it('stop disconnects and resets state', () => {
    startWith([item(1)], 1);
    service.stop();

    expect(fakeSocket.disconnect).toHaveBeenCalled();
    expect(service.items()).toEqual([]);
    expect(service.unreadCount()).toBe(0);
  });

  it('query sends the filters and keeps the bell list untouched', () => {
    startWith([item(1)], 1);

    let result: AdminInboxItem[] = [];
    service.query({ type: 'new_ad_pending', unreadOnly: true, beforeId: 30 }).subscribe((d) => (result = d.items));
    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/inbox'));
    expect(req.request.params.get('type')).toBe('new_ad_pending');
    expect(req.request.params.get('unreadOnly')).toBe('true');
    expect(req.request.params.get('beforeId')).toBe('30');
    req.flush({ status: 'success', message: 'success', data: { items: [item(9, { type: 'new_ad_pending' })], unreadCount: 4 } });

    expect(result.map((i) => i.id)).toEqual([9]);
    expect(service.items().map((i) => i.id)).toEqual([1]);
    expect(service.unreadCount()).toBe(4);
  });

  it('query omits filters that are not set', () => {
    service.query({ type: null, unreadOnly: false }).subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/inbox'));
    expect(req.request.params.has('type')).toBeFalse();
    expect(req.request.params.has('unreadOnly')).toBeFalse();
    expect(req.request.params.has('beforeId')).toBeFalse();
    req.flush({ status: 'success', message: 'success', data: { items: [], unreadCount: 0 } });
  });

  it('received$ emits each new socket item once', () => {
    startWith([], 0);
    const seen: number[] = [];
    service.received$.subscribe((i) => seen.push(i.id));

    handlers[ADMIN_NOTIFICATION_EVENT](item(7));
    handlers[ADMIN_NOTIFICATION_EVENT](item(7));

    expect(seen).toEqual([7]);
  });

  describe('desktop alerts', () => {
    it('shows a tagged alert only while the tab is hidden', () => {
      startWith([], 0);
      const hidden = spyOnProperty(document, 'hidden').and.returnValue(false);

      handlers[ADMIN_NOTIFICATION_EVENT](item(1));
      expect(FakeNotification.instances.length).toBe(0);

      hidden.and.returnValue(true);
      handlers[ADMIN_NOTIFICATION_EVENT](item(2));
      expect(FakeNotification.instances.length).toBe(1);
      expect(FakeNotification.instances[0].options.tag).toBe('admin-inbox-2');
    });

    it('does nothing without permission or after opting out', () => {
      startWith([], 0);
      spyOnProperty(document, 'hidden').and.returnValue(true);

      FakeNotification.permission = 'default';
      handlers[ADMIN_NOTIFICATION_EVENT](item(1));

      FakeNotification.permission = 'granted';
      localStorage.setItem(DESKTOP_ALERTS_STORAGE_KEY, 'off');
      handlers[ADMIN_NOTIFICATION_EVENT](item(2));

      expect(FakeNotification.instances.length).toBe(0);
    });

    it('clicking the alert marks it read and opens its page', () => {
      startWith([], 0);
      spyOnProperty(document, 'hidden').and.returnValue(true);
      const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);

      handlers[ADMIN_NOTIFICATION_EVENT](item(3, { type: 'identity_submitted', entity_id: 44 }));
      const alert = FakeNotification.instances[0];
      alert.onclick!();

      expect(alert.close).toHaveBeenCalled();
      expect(navigate).toHaveBeenCalledWith(['/identity-requests', '44']);
      httpMock.expectOne((r) => r.url.endsWith('/admin/inbox/3/read'))
        .flush({ status: 'success', message: 'success', data: { id: 3, unreadCount: 0 } });
    });

    it('requestDesktopPermission records the choice', fakeAsync(() => {
      FakeNotification.requestPermission.and.resolveTo('granted');
      service.requestDesktopPermission();
      flushMicrotasks();

      expect(service.desktopPermission()).toBe('granted');
      expect(localStorage.getItem(DESKTOP_ALERTS_STORAGE_KEY)).toBe('on');
    }));
  });

  it('timeAgo buckets elapsed time', () => {
    const now = 1_700_000_000_000;
    expect(service.timeAgo(now - 10_000, now)).not.toContain('{n}');
    expect(service.timeAgo(now - 5 * 60_000, now)).toContain('5');
    expect(service.timeAgo(now - 3 * 3_600_000, now)).toContain('3');
    expect(service.timeAgo(now - 2 * 86_400_000, now)).toContain('2');
  });
});
