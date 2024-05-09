type ResourceContextType = {
  germlineAccess: boolean;
  reportsAccess: boolean;
  adminAccess: boolean;
  managerAccess: boolean;
  reportSettingAccess: boolean;
  reportEditAccess: boolean;
  unreviewedAccess: boolean;
  nonproductionAccess: boolean;
  allStates: string[];
  unreviewedStates: string[];
  nonproductionStates: string[];
};

export default ResourceContextType;
