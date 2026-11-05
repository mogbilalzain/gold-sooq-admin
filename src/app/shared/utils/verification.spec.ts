import { toFlag } from './verification';

describe('toFlag', () => {
  it('treats 1 and "1" as true', () => {
    expect(toFlag(1)).toBeTrue();
    expect(toFlag('1')).toBeTrue();
  });

  it('treats true as true', () => {
    expect(toFlag(true)).toBeTrue();
  });

  it('treats "0", 0, null, undefined and false as false', () => {
    expect(toFlag('0')).toBeFalse();
    expect(toFlag(0)).toBeFalse();
    expect(toFlag(null)).toBeFalse();
    expect(toFlag(undefined)).toBeFalse();
    expect(toFlag(false)).toBeFalse();
  });

  it('treats other values as false', () => {
    expect(toFlag('yes')).toBeFalse();
    expect(toFlag(2)).toBeFalse();
  });
});
