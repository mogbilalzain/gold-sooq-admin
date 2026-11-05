/**
 * Maps known backend error codes to translation keys so raw technical
 * messages are never shown to the admin.
 */
export const API_ERROR_CODE_KEYS: Record<string, string> = {
  ATTRIBUTE_CODE_EXISTS: 'apiErrors.attributeCodeExists',
  ATTRIBUTE_HAS_VALUES: 'apiErrors.attributeHasValues',
  ATTRIBUTE_INVALID_OPTION: 'apiErrors.attributeInvalidOption',
  PARENT_ATTRIBUTE_NOT_ASSIGNED: 'apiErrors.parentAttributeNotAssigned',
  ATTRIBUTE_HAS_DEPENDENTS: 'apiErrors.attributeHasDependents',
  ID_EXPIRED: 'apiErrors.idExpired',
  IDENTITY_ALREADY_CLAIMED: 'apiErrors.identityAlreadyClaimed',
  IDENTITY_REVOKED_CONTACT_SUPPORT: 'apiErrors.identityRevokedContactSupport',
  LICENSE_EXPIRED: 'apiErrors.licenseExpired',
  BUSINESS_LICENSE_ALREADY_CLAIMED: 'apiErrors.businessLicenseAlreadyClaimed',
  NOT_A_BUSINESS_PROFILE: 'apiErrors.notABusinessProfile',
};

/**
 * Best-effort extraction of a backend error code from an HttpErrorResponse.
 * Looks at common code carriers, then falls back to matching a known code
 * token inside the message. Returns null when nothing is found.
 */
export function extractApiErrorCode(error: unknown): string | null {
  const e = error as {
    code?: unknown;
    message?: unknown;
    error?: { code?: unknown; message?: unknown; data?: { code?: unknown } };
  } | null;

  const candidates: unknown[] = [
    e?.error?.code,
    e?.error?.data?.code,
    e?.code,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
  }

  const msg = e?.error?.message ?? e?.message;
  if (typeof msg === 'string') {
    const match = msg.match(/[A-Z][A-Z0-9_]{3,}/);
    if (match && API_ERROR_CODE_KEYS[match[0]]) return match[0];
  }
  return null;
}
