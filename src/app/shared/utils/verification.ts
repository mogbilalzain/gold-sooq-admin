/**
 * Normalizes backend verification flags.
 * The API may send flags as 0/1 numbers or "0"/"1" strings.
 * The string "0" is truthy in JS, so it must be mapped explicitly to false.
 */
export function toFlag(value: unknown): boolean {
  return value === true || value === 1 || value === '1';
}
