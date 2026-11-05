import { Injectable, InjectionToken, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, Subject, finalize, map, tap } from 'rxjs';
import { io, Socket, ManagerOptions, SocketOptions } from 'socket.io-client';
import { ApiConfigService } from '../api/api-config.service';
import { TokenStorageService } from '../auth/token-storage.service';
import { TranslationService } from '../translation.service';

export interface ApiResponse<T> {
  message: string;
  status: string;
  data: T;
}

export type AdminInboxType =
  | 'new_ad_pending'
  | 'identity_submitted'
  | 'business_submitted'
  | 'contact_message';

export interface AdminInboxItem {
  id: number;
  type: AdminInboxType;
  entity_id: number | null;
  title_ar: string;
  title_en: string;
  message_ar: string;
  message_en: string;
  is_read: number;
  /** Epoch milliseconds. */
  created_at: number;
}

export interface InboxListData {
  items: AdminInboxItem[];
  unreadCount: number;
}

export interface InboxQuery {
  type?: AdminInboxType | null;
  unreadOnly?: boolean;
  beforeId?: number;
}

export const ADMIN_INBOX_TYPES: AdminInboxType[] = [
  'new_ad_pending',
  'identity_submitted',
  'business_submitted',
  'contact_message',
];

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export const INBOX_PAGE_SIZE = 20;
export const ADMIN_NOTIFICATION_EVENT = 'admin:notification';
export const DESKTOP_ALERTS_STORAGE_KEY = 'adminInbox.desktopAlerts';

export type SocketFactory = (url: string, opts: Partial<ManagerOptions & SocketOptions>) => Socket;

/** Overridable in tests so no real socket is opened. */
export const ADMIN_INBOX_SOCKET_FACTORY = new InjectionToken<SocketFactory>('ADMIN_INBOX_SOCKET_FACTORY', {
  providedIn: 'root',
  factory: () => io,
});

/** The browser Notification API, or null where unsupported. Overridable in tests. */
export const ADMIN_INBOX_NOTIFICATION_API = new InjectionToken<typeof Notification | null>(
  'ADMIN_INBOX_NOTIFICATION_API',
  {
    providedIn: 'root',
    factory: () => (typeof Notification === 'undefined' ? null : Notification),
  }
);

export type DesktopPermission = NotificationPermission | 'unsupported';

const ROUTE_PREFIX: Record<AdminInboxType, string> = {
  new_ad_pending: '/posts-ads',
  identity_submitted: '/identity-requests',
  business_submitted: '/business-requests',
  contact_message: '/contact-messages',
};

@Injectable({ providedIn: 'root' })
export class AdminInboxService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);
  private tokenStorage = inject(TokenStorageService);
  private socketFactory = inject(ADMIN_INBOX_SOCKET_FACTORY);
  private notificationApi = inject(ADMIN_INBOX_NOTIFICATION_API);
  private document = inject(DOCUMENT);
  private router = inject(Router);
  private translationService = inject(TranslationService);

  readonly items = signal<AdminInboxItem[]>([]);
  readonly unreadCount = signal(0);
  readonly hasMore = signal(false);
  readonly loading = signal(false);
  readonly desktopPermission = signal<DesktopPermission>(this.notificationApi?.permission ?? 'unsupported');

  private readonly receivedSubject = new Subject<AdminInboxItem>();
  /** New items pushed over the socket (already de-duplicated). */
  readonly received$ = this.receivedSubject.asObservable();

  private socket: Socket | null = null;

  /** Load the first page and subscribe to live events. Safe to call more than once. */
  start(): void {
    if (this.socket) {
      return;
    }
    const token = this.tokenStorage.getToken();
    if (!token) {
      return;
    }

    this.fetchPage().subscribe((data) => {
      this.items.set(data.items);
      this.unreadCount.set(data.unreadCount);
    });

    // Websocket-only: the backend's socket.io server has no CORS config, so
    // the cross-origin long-polling handshake would be blocked in development.
    this.socket = this.socketFactory(this.apiConfig.getSocketUrl(), {
      auth: { token },
      transports: ['websocket'],
    });
    this.socket.on(ADMIN_NOTIFICATION_EVENT, (item: AdminInboxItem) => this.receive(item));
  }

  stop(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.items.set([]);
    this.unreadCount.set(0);
    this.hasMore.set(false);
  }

  loadMore(): void {
    const current = this.items();
    if (!current.length || this.loading()) {
      return;
    }
    this.fetchPage(current[current.length - 1].id).subscribe((data) => {
      this.items.update((list) => [...list, ...data.items]);
      this.unreadCount.set(data.unreadCount);
    });
  }

  markRead(item: AdminInboxItem): Observable<ApiResponse<{ id: number; unreadCount: number }>> {
    return this.http.patch<ApiResponse<{ id: number; unreadCount: number }>>(
      `${this.apiConfig.getAdminInboxUrl()}/${item.id}/read`, {}
    ).pipe(
      tap((res) => {
        this.items.update((list) => list.map((i) => (i.id === item.id ? { ...i, is_read: 1 } : i)));
        this.unreadCount.set(res.data.unreadCount);
      })
    );
  }

  markAllRead(): Observable<ApiResponse<{ updated: number; unreadCount: number }>> {
    return this.http.patch<ApiResponse<{ updated: number; unreadCount: number }>>(
      `${this.apiConfig.getAdminInboxUrl()}/read-all`, {}
    ).pipe(
      tap(() => {
        this.items.update((list) => list.map((i) => ({ ...i, is_read: 1 })));
        this.unreadCount.set(0);
      })
    );
  }

  /** Filtered, paginated read for the archive page; leaves the bell's list untouched. */
  query(filters: InboxQuery): Observable<InboxListData> {
    const params: Record<string, string> = { limit: String(INBOX_PAGE_SIZE) };
    if (filters.type) {
      params['type'] = filters.type;
    }
    if (filters.unreadOnly) {
      params['unreadOnly'] = 'true';
    }
    if (filters.beforeId) {
      params['beforeId'] = String(filters.beforeId);
    }
    return this.http
      .get<ApiResponse<InboxListData>>(this.apiConfig.getAdminInboxUrl(), { params })
      .pipe(
        map((res) => res.data),
        tap((data) => this.unreadCount.set(data.unreadCount))
      );
  }

  /** Must be called from a user click: browsers ignore permission prompts otherwise. */
  requestDesktopPermission(): void {
    const api = this.notificationApi;
    if (!api) {
      return;
    }
    api.requestPermission().then((permission) => {
      this.desktopPermission.set(permission);
      localStorage.setItem(DESKTOP_ALERTS_STORAGE_KEY, permission === 'granted' ? 'on' : 'off');
    });
  }

  /** True when the admin turned desktop alerts on but the browser now blocks them. */
  get desktopBlockedAfterOptIn(): boolean {
    return this.desktopPermission() === 'denied' && localStorage.getItem(DESKTOP_ALERTS_STORAGE_KEY) === 'on';
  }

  titleOf(item: AdminInboxItem): string {
    return this.translationService.isRTL ? item.title_ar : item.title_en;
  }

  messageOf(item: AdminInboxItem): string {
    return this.translationService.isRTL ? item.message_ar : item.message_en;
  }

  typeLabel(type: AdminInboxType): string {
    return this.translationService.t(`adminInbox.types.${type}`);
  }

  timeAgo(createdAt: number, now = Date.now()): string {
    const elapsed = Math.max(0, now - Number(createdAt));
    const t = (key: string, n: number) =>
      this.translationService.t(`adminInbox.${key}`).replace('{n}', String(n));
    if (elapsed < MINUTE_MS) {
      return this.translationService.t('adminInbox.justNow');
    }
    if (elapsed < HOUR_MS) {
      return t('minutesAgo', Math.floor(elapsed / MINUTE_MS));
    }
    if (elapsed < DAY_MS) {
      return t('hoursAgo', Math.floor(elapsed / HOUR_MS));
    }
    return t('daysAgo', Math.floor(elapsed / DAY_MS));
  }

  routeFor(item: AdminInboxItem): string[] {
    const prefix = ROUTE_PREFIX[item.type];
    if (!prefix) {
      return ['/'];
    }
    return item.entity_id != null ? [prefix, String(item.entity_id)] : [prefix];
  }

  private receive(item: AdminInboxItem): void {
    if (this.items().some((i) => i.id === item.id)) {
      return;
    }
    this.items.update((list) => [item, ...list]);
    if (!item.is_read) {
      this.unreadCount.update((n) => n + 1);
    }
    this.receivedSubject.next(item);
    this.showDesktopAlert(item);
  }

  private showDesktopAlert(item: AdminInboxItem): void {
    const api = this.notificationApi;
    if (!api || api.permission !== 'granted' || !this.document.hidden) {
      return;
    }
    if (localStorage.getItem(DESKTOP_ALERTS_STORAGE_KEY) === 'off') {
      return;
    }
    const alert = new api(this.titleOf(item), {
      body: this.messageOf(item),
      tag: `admin-inbox-${item.id}`,
    });
    alert.onclick = () => {
      this.document.defaultView?.focus();
      alert.close();
      if (!item.is_read) {
        this.markRead(item).subscribe();
      }
      this.router.navigate(this.routeFor(item));
    };
  }

  private fetchPage(beforeId?: number): Observable<InboxListData> {
    this.loading.set(true);
    return this.query({ beforeId }).pipe(
      tap((data) => this.hasMore.set(data.items.length === INBOX_PAGE_SIZE)),
      finalize(() => this.loading.set(false))
    );
  }
}
