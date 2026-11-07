import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { SiteAnalyticsOverview, SiteAnalyticsService } from './site-analytics.service';

describe('SiteAnalyticsService', () => {
  let service: SiteAnalyticsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SiteAnalyticsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getOverview reads GET /admin/site-analytics/overview with the days range', () => {
    const overview: SiteAnalyticsOverview = {
      days: 7,
      totals: { visitors: 3, pageViews: 4, downloadClicks: 2, ios: 1, android: 1, conversionRate: 66.7 },
      daily: [{ date: '2026-11-07', visitors: 3, pageViews: 4, downloads: 2 }],
      downloadsByPlacement: [{ placement: 'hero', ios: 1, android: 0, total: 1 }],
      topPages: [{ path: '/ar', views: 2, visitors: 2 }],
      devices: { mobile: 1, tablet: 1, desktop: 1 },
      topReferrers: [{ host: 'google.com', visits: 1 }],
    };

    let result: SiteAnalyticsOverview | undefined;
    service.getOverview(7).subscribe((res) => (result = res.data));

    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/site-analytics/overview'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('days')).toBe('7');
    req.flush({ status: 'success', message: 'success', data: overview });

    expect(result).toEqual(overview);
  });
});
