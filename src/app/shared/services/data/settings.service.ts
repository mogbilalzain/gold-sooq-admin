import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

interface SettingsResponse {
  status: string;
  message: string;
  data: { currency: string };
}

const CACHE_KEY = 'app_currency';
const DEFAULT_CURRENCY = 'AED';

/**
 * Admin panel display settings. There is no /admin/settings endpoint in the
 * backend, so the preferred currency is stored locally only (localStorage) —
 * it drives fallback labels when a prices response carries no currency.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {

  readonly availableCurrencies = [
    'AED', 'SAR', 'USD', 'SDG', 'EGP', 'QAR', 'KWD', 'OMR', 'BHD'
  ];

  private readonly currency$ = new BehaviorSubject<string>(
    localStorage.getItem(CACHE_KEY) || DEFAULT_CURRENCY
  );

  get currency(): string {
    return this.currency$.value;
  }

  get currencyChange(): Observable<string> {
    return this.currency$.asObservable();
  }

  /** No-op kept for call-site compatibility — settings are local-only. */
  loadSettings(): void {
    // Nothing to fetch: the backend has no settings endpoint.
  }

  updateCurrency(currency: string): Observable<SettingsResponse> {
    this.setCurrency(currency);
    return of({ status: 'success', message: 'success', data: { currency } });
  }

  private setCurrency(currency: string): void {
    this.currency$.next(currency);
    localStorage.setItem(CACHE_KEY, currency);
  }
}
