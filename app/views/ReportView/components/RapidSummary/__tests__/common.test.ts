import { extractUUID, UNSPECIFIED_EVIDENCE_LEVEL } from '../common';

describe('extractUUID', () => {
  const uuid = '550e8400-e29b-41d4-a716-446655440000';

  test('extracts a uuid embedded in a string', () => {
    expect(extractUUID(`graphkb context ${uuid} trailing`)).toBe(uuid);
  });

  test('returns the uuid when the string is exactly a uuid', () => {
    expect(extractUUID(uuid)).toBe(uuid);
  });

  test('returns null when no uuid is present', () => {
    expect(extractUUID('no identifier here')).toBeNull();
  });

  test('returns null for the default empty string', () => {
    expect(extractUUID()).toBeNull();
  });
});

describe('UNSPECIFIED_EVIDENCE_LEVEL', () => {
  test('is the expected fallback label', () => {
    expect(UNSPECIFIED_EVIDENCE_LEVEL).toBe('Unspecified evidence level');
  });
});
