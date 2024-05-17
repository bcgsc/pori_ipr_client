const ALL_ROLES = [
  'admin',
  'bioinformatician',
  'manager',
  'non-production access',
  'report manager',
];

/*
  Checks if a user is allowed access, given an allow and block list, with allow list taking precedence
*/
const checkAccess = (
  groups: { ident: string, name: string }[],
  allowList: string[],
  blockList: string[] = ALL_ROLES,
): boolean => {
  if (groups.length < 1) { return false; }
  const groupNames = groups.map((group) => group.name.toLowerCase());
  const isAllowed = allowList.includes('*') || allowList.some((group) => groupNames.includes(group.toLowerCase()));
  const isBlocked = blockList.some((group) => groupNames.includes(group.toLowerCase()));
  return isAllowed || !isBlocked;
};

export {
  checkAccess,
  ALL_ROLES,
};
export default checkAccess;
