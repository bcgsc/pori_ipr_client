/* Checks a user's access given an allowList and a blockList */
const checkAccess = (
  groups: { ident: string, name: string }[],
  allowList: string[],
  blockList: string[],
): boolean => {
  const groupNames = groups.map((group) => group.name.toLowerCase());

  /* blockList takes priority over allowList */
  if ((groupNames.some((groupName) => allowList.includes(groupName)) || allowList.includes('*'))
    && groupNames.every((groupName) => !blockList.includes(groupName))) {
    return true;
  }
  return false;
};

export default checkAccess;
