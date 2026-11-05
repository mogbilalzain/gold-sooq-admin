import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { ApiConfigService } from '../api/api-config.service';

export interface Country {
  id: number;
  name_ar: string;
  name_en: string;
  /** ISO2 country code (e.g. 'AE', 'SD'). */
  code?: string;
}

export interface StateEmirate {
  id: number;
  countryId: number;
  name_ar: string;
  name_en: string;
}

interface CountriesCurrenciesResponse {
  status: string;
  message: string;
  data: {
    CountriesData: Array<{ id: number; name_ar: string; name_en: string; iso2?: string }>;
    CurrenciesData: unknown[];
  };
}

interface StatesResponse {
  status: string;
  message: string;
  data: Array<{ id: number; name_en: string; name_ar: string; country_id: number }>;
}

/**
 * Countries / states (emirates) lookup layer, backed by the public endpoints:
 * - GET /countriesCurrencies/getAllCountriesAndCurrencies
 * - GET /states/getAllStatesByCountryId/:countryId
 * Results are cached for the session — they change rarely.
 */
@Injectable({
  providedIn: 'root',
})
export class LookupService {
  readonly isAvailable = true;

  private countries$?: Observable<Country[]>;
  private readonly statesCache = new Map<number, Observable<StateEmirate[]>>();

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {}

  getCountries(): Observable<Country[]> {
    if (!this.countries$) {
      this.countries$ = this.http
        .get<CountriesCurrenciesResponse>(
          `${this.apiConfig.getCountriesCurrenciesUrl()}/getAllCountriesAndCurrencies`
        )
        .pipe(
          map((res) =>
            (res?.data?.CountriesData || []).map((c) => ({
              id: c.id,
              name_ar: c.name_ar,
              name_en: c.name_en,
              code: c.iso2,
            }))
          ),
          catchError(() => of([] as Country[])),
          shareReplay(1)
        );
    }
    return this.countries$;
  }

  getStatesByCountry(countryId: number): Observable<StateEmirate[]> {
    let cached = this.statesCache.get(countryId);
    if (!cached) {
      cached = this.http
        .get<StatesResponse>(
          `${this.apiConfig.getStatesUrl()}/getAllStatesByCountryId/${countryId}`
        )
        .pipe(
          map((res) =>
            (res?.data || []).map((s) => ({
              id: s.id,
              name_ar: s.name_ar,
              name_en: s.name_en,
              countryId: s.country_id,
            }))
          ),
          // The endpoint 404s when a country has no states — an empty list, not an error.
          catchError(() => of([] as StateEmirate[])),
          shareReplay(1)
        );
      this.statesCache.set(countryId, cached);
    }
    return cached;
  }
}
