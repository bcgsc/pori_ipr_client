// Heavy auth/network imports are pulled in by the module; stub them so the helper can be imported
jest.mock('@/services/api');
jest.mock('fetch-intercept', () => ({ register: jest.fn() }));
jest.mock('@/services/management/auth', () => ({
  login: jest.fn(),
  isAuthorized: jest.fn(),
  getReferrerUri: jest.fn(),
  keycloak: {},
}));

// eslint-disable-next-line import/first
import { trimKeyCloakStates } from '..';

describe('trimKeyCloakStates', () => {
  test('keeps everything before the first ampersand', () => {
    expect(trimKeyCloakStates('#state=abc&session_state=def&code=ghi')).toBe('#state=abc');
  });

  test('returns the whole string when there is no ampersand', () => {
    expect(trimKeyCloakStates('#/reports')).toBe('#/reports');
  });

  test('returns an empty string for empty or missing input', () => {
    expect(trimKeyCloakStates('')).toBe('');
    expect(trimKeyCloakStates()).toBe('');
  });
});
