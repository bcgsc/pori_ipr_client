import checkAccess from '../checkAccess';

describe('checkAccess', () => {
  const mockUserGroups = [
    {
      name: 'clinician',
      ident: 'uuid1',
    },
    {
      name: 'manager',
      ident: 'uuid2',
    },
  ];

  test('Allow access when both allow and block list is empty', () => {
    expect(checkAccess(mockUserGroups, [], [])).toEqual(true);
  });

  test('Allow access when * is given as allowList, regardless if blocklist has role in user roles', () => {
    expect(checkAccess(mockUserGroups, ['*'], ['clinician'])).toEqual(true);
  });

  test('Allow access when user has roles in both allow and block list', () => {
    expect(checkAccess(mockUserGroups, ['clinician'], ['manager'])).toEqual(true);
  });

  test('Block access when user has role in blockList, but no roles corresponding to allowList', () => {
    expect(checkAccess(mockUserGroups, ['aliens'], ['manager'])).toEqual(false);
  });
});
