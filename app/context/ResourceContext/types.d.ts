type ResourceContextType = {
  adminAccess: boolean;
  allStates: string[];
  allProjectsAccess: boolean;
  appendixEditAccess: boolean;
  germlineAccess: boolean;
  managerAccess: boolean;
  nonproductionAccess: boolean;
  nonproductionStates: string[];
  reportAssignmentAccess: boolean;
  reportEditAccess: boolean;
  reportSettingAccess: boolean;
  reportsAccess: boolean;
  templateEditAccess: boolean;
  unreviewedAccess: boolean;
  unreviewedStates: string[];
  checkGroupEditPermissions(groupName: string): boolean;
};

export default ResourceContextType;
