const DUBAI_TZ = 'Asia/Dubai';

/**
 * Today's calendar date in Asia/Dubai as "YYYY-MM-DD" (date-only, no timezone shift).
 */
export function todayInDubai(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: DUBAI_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type: string): string => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/**
 * True when `dateOnly` ("YYYY-MM-DD") is strictly after today in Asia/Dubai.
 * Compares date-only strings, so no timezone shifting of the input occurs.
 */
export function isFutureDubaiDate(dateOnly: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return false;
  return dateOnly > todayInDubai();
}

/**
 * Normalizes an Emirates ID / license number for client-side validation:
 * converts Arabic-Indic and Eastern Arabic-Indic digits to Latin digits and
 * strips every non-digit character (dashes, spaces).
 * The backend performs its own authoritative normalization.
 */
export function normalizeDigits(value: string): string {
  const arabicIndic = '٠١٢٣٤٥٦٧٨٩';
  const easternArabicIndic = '۰۱۲۳۴۵۶۷۸۹';
  let out = '';
  for (const ch of value) {
    const ai = arabicIndic.indexOf(ch);
    const ei = easternArabicIndic.indexOf(ch);
    if (ai >= 0) out += String(ai);
    else if (ei >= 0) out += String(ei);
    else if (ch >= '0' && ch <= '9') out += ch;
  }
  return out;
}

/** The 15-digit Emirates ID format (after normalization). */
export function isValidEmiratesId(value: string): boolean {
  return normalizeDigits(value).length === 15;
}
