import { isFutureDubaiDate, isValidEmiratesId, normalizeDigits, todayInDubai } from './dubai-date';

describe('todayInDubai', () => {
  it('returns a YYYY-MM-DD date-only string', () => {
    expect(todayInDubai()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('uses the Dubai calendar date, not UTC (UTC+4, 23:30 UTC = next day in Dubai)', () => {
    // 2026-01-01 21:30 UTC = 2026-01-02 01:30 in Asia/Dubai
    const now = new Date(Date.UTC(2026, 0, 1, 21, 30));
    expect(todayInDubai(now)).toBe('2026-01-02');
  });
});

describe('isFutureDubaiDate', () => {
  it('accepts dates after today in Dubai', () => {
    expect(isFutureDubaiDate('2999-01-01')).toBeTrue();
  });

  it('rejects today and past dates', () => {
    expect(isFutureDubaiDate(todayInDubai())).toBeFalse();
    expect(isFutureDubaiDate('2000-01-01')).toBeFalse();
  });

  it('rejects malformed input instead of shifting timezones', () => {
    expect(isFutureDubaiDate('2028-12-31T00:00:00Z')).toBeFalse();
    expect(isFutureDubaiDate('31/12/2028')).toBeFalse();
    expect(isFutureDubaiDate('')).toBeFalse();
  });
});

describe('normalizeDigits', () => {
  it('converts Arabic-Indic digits to Latin digits', () => {
    expect(normalizeDigits('٧٨٤١٩٩٠١٢٣٤٥٦٧١')).toBe('784199012345671');
  });

  it('converts Eastern Arabic-Indic digits to Latin digits', () => {
    expect(normalizeDigits('۷۸۴۱۲۳')).toBe('784123');
  });

  it('strips dashes and spaces', () => {
    expect(normalizeDigits('784-1990-1234567-1')).toBe('784199012345671');
    expect(normalizeDigits('784 1990 1234567 1')).toBe('784199012345671');
  });
});

describe('isValidEmiratesId', () => {
  it('accepts 15 digits after normalization', () => {
    expect(isValidEmiratesId('784-1990-1234567-1')).toBeTrue();
    expect(isValidEmiratesId('784199012345671')).toBeTrue();
    expect(isValidEmiratesId('٧٨٤-١٩٩٠-١٢٣٤٥٦٧-١')).toBeTrue();
  });

  it('rejects other lengths', () => {
    expect(isValidEmiratesId('7841990')).toBeFalse();
    expect(isValidEmiratesId('')).toBeFalse();
  });
});
