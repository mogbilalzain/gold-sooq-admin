import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { BusinessProfileComponent } from './business-profile.component';
import { BusinessService, BusinessPublicProfile, UpdateBusinessProfilePayload } from '../../../shared/services/data/business.service';

const baseProfile: BusinessPublicProfile = {
  userId: 7,
  profileStatus: 'verified',
  tradeName: 'متجر الذهب',
  legalName: 'Golden LLC',
  description: 'وصف قديم',
  contactPhone: '+971500000000',
  contactEmail: 'old@example.com',
  websiteUrl: 'https://old.example',
  addressLine: 'Dubai',
  socialLinks: [{ platform: 'instagram', url: 'https://instagram.com/old' }],
  workingHours: [{ day: 'Monday', open: '09:00', close: '18:00', closed: false }],
  logoUrl: 'https://cdn.example/logo.png',
  coverUrl: 'https://cdn.example/cover.png',
  logoStorageKey: 'logos/7.png',
  coverStorageKey: 'covers/7.png',
};

describe('BusinessProfileComponent (partial updates)', () => {
  let component: BusinessProfileComponent;
  let fixture: ComponentFixture<BusinessProfileComponent>;
  let sentPayloads: UpdateBusinessProfilePayload[];
  let businessServiceStub: Partial<BusinessService>;

  beforeEach(async () => {
    sentPayloads = [];
    businessServiceStub = {
      getPublicProfile: jasmine.createSpy('getPublicProfile').and.returnValue(
        of({ status: 'success', message: '', data: { ...baseProfile } })
      ),
      updatePublicProfile: jasmine.createSpy('updatePublicProfile').and.callFake(
        (payload: UpdateBusinessProfilePayload) => {
          sentPayloads.push(payload);
          return of({ status: 'success', message: '', data: {} });
        }
      ),
    };

    await TestBed.configureTestingModule({
      imports: [BusinessProfileComponent],
      providers: [
        { provide: BusinessService, useValue: businessServiceStub },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ userId: '7' })) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BusinessProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // loads the profile
  });

  function enterEditWithFreshProfile(): void {
    component.enterEdit();
  }

  it('sends nothing but userId when nothing changed', () => {
    enterEditWithFreshProfile();
    expect(component.hasChanges()).toBeFalse();
    expect(component.canSave()).toBeFalse();
    expect(sentPayloads.length).toBe(0);
  });

  it('omits untouched fields from the payload', () => {
    enterEditWithFreshProfile();
    component.form.tradeName = 'اسم جديد';
    component.save();

    expect(sentPayloads.length).toBe(1);
    const payload = sentPayloads[0] as unknown as Record<string, unknown>;
    expect(payload['userId']).toBe(7);
    expect(payload['tradeName']).toBe('اسم جديد');
    expect('description' in payload).toBeFalse();
    expect('contactPhone' in payload).toBeFalse();
    expect('socialLinks' in payload).toBeFalse();
    expect('workingHours' in payload).toBeFalse();
    expect('logoStorageKey' in payload).toBeFalse();
    expect('coverStorageKey' in payload).toBeFalse();
  });

  it('sends an explicit null when the logo is removed', () => {
    enterEditWithFreshProfile();
    component.onLogoCleared();
    component.save();

    const payload = sentPayloads[0] as unknown as Record<string, unknown>;
    expect('logoStorageKey' in payload).toBeTrue();
    expect(payload['logoStorageKey']).toBeNull();
    expect('coverStorageKey' in payload).toBeFalse();
  });

  it('sends the new storage key after an upload, not the URL', () => {
    enterEditWithFreshProfile();
    component.onCoverUploaded('covers/new-key.png');
    component.save();

    const payload = sentPayloads[0] as unknown as Record<string, unknown>;
    expect(payload['coverStorageKey']).toBe('covers/new-key.png');
  });

  it('sends the whole socialLinks array only when it changed', () => {
    enterEditWithFreshProfile();
    component.form.socialLinks.push({ platform: 'x', url: 'https://x.com/new' });
    component.save();

    const payload = sentPayloads[0] as unknown as Record<string, unknown>;
    expect(payload['socialLinks']).toEqual([
      { platform: 'instagram', url: 'https://instagram.com/old' },
      { platform: 'x', url: 'https://x.com/new' },
    ]);
  });

  it('normalizes closed working-hours entries to empty times', () => {
    enterEditWithFreshProfile();
    const saturday = component.form.workingHours.find((h) => h.day === 'Saturday');
    expect(saturday).toBeTruthy();
    saturday!.closed = true;
    component.save();

    const payload = sentPayloads[0] as unknown as Record<string, unknown>;
    const hours = payload['workingHours'] as { day: string; open: string; close: string; closed: boolean }[];
    expect(hours.length).toBe(7);
    const sat = hours.find((h) => h.day === 'Saturday')!;
    expect(sat.closed).toBeTrue();
    expect(sat.open).toBe('');
    expect(sat.close).toBe('');
    // Existing API values are kept for untouched days.
    const mon = hours.find((h) => h.day === 'Monday')!;
    expect(mon).toEqual({ day: 'Monday', open: '09:00', close: '18:00', closed: false });
  });

  it('blocks saving when the description exceeds 2000 characters', () => {
    enterEditWithFreshProfile();
    component.form.description = 'x'.repeat(2001);
    expect(component.canSave()).toBeFalse();
    component.save();
    expect(sentPayloads.length).toBe(0);
  });
});
