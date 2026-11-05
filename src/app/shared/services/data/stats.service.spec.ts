import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { StatsOverview, StatsService } from './stats.service';

describe('StatsService', () => {
  let service: StatsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StatsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getOverview reads GET /admin/stats/overview', () => {
    const overview: StatsOverview = {
      pending: { ads: 2, identity: 3, business: 0, contactMessages: 1 },
      totals: { users: 4, posts: 4, activePosts: 3, categories: 40 },
      daily: [{ date: '2026-11-04', users: 1, ads: 2 }],
    };

    let result: StatsOverview | undefined;
    service.getOverview().subscribe((res) => (result = res.data));

    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/stats/overview'));
    expect(req.request.method).toBe('GET');
    req.flush({ status: 'success', message: 'success', data: overview });

    expect(result).toEqual(overview);
  });
});
