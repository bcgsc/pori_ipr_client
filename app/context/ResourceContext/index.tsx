import React, {
  createContext, ReactChild, useMemo,
} from 'react';
import { checkAccess, ALL_ROLES, NO_GROUP_MATCH } from '@/utils/checkAccess';
import useSecurity from '@/hooks/useSecurity';
import ResourceContextType from './types';

const GERMLINE_ACCESS = ['admin', 'manager', 'germline access'];
const UNREVIEWED_ACCESS = ['admin', 'manager', 'unreviewed access'];
const NONPRODUCTION_ACCESS = ['admin', 'manager', 'non-production access'];
const TEMPLATE_EDIT_ACCESS = ['admin', 'manager', 'template edit access'];
const APPENDIX_EDIT_ACCESS = ['admin', 'manager', 'appendix edit access'];
const REPORT_ASSIGNMENT_ACCESS = ['admin', 'manager', 'report assignment access'];

const GERMLINE_BLOCK = [...ALL_ROLES, ...NO_GROUP_MATCH];
const UNREVIEWED_ACCESS_BLOCK = NO_GROUP_MATCH;
const NONPRODUCTION_ACCESS_BLOCK = NO_GROUP_MATCH;

const ALL_STATES = ['signedoff', 'nonproduction', 'uploaded', 'reviewed', 'completed', 'ready', 'active'];
const UNREVIEWED_STATES = ['uploaded', 'ready', 'active']; // TODO decide if nonproduction should go in unreviewed as well
const NONPRODUCTION_STATES = ['nonproduction'];

const REPORTS_ACCESS = ['*'];
const REPORTS_BLOCK = [];
const ADMIN_ACCESS = ['admin'];
const ADMIN_BLOCK = [...ALL_ROLES, ...NO_GROUP_MATCH];

/**
 * Checks user permissions based on the groups they are assigned, nothing report-specific
 */
const useResources = (): ResourceContextType => {
  const { userDetails: { groups } } = useSecurity();

  return useMemo<ResourceContextType>(() => {
    const userGroups = groups ?? [];
    const managerAccess = checkAccess(userGroups, [...ADMIN_ACCESS, 'manager'], ADMIN_BLOCK);

    return {
      adminAccess: checkAccess(userGroups, ADMIN_ACCESS, ADMIN_BLOCK),
      createProjectAccess: checkAccess(userGroups, CREATE_PROJECT_ACCESS, ADMIN_BLOCK),
      allProjectsAccess: checkAccess(userGroups, [...ADMIN_ACCESS, 'all projects access'], ADMIN_BLOCK),
      allStates: ALL_STATES,
      appendixEditAccess: checkAccess(userGroups, [...APPENDIX_EDIT_ACCESS], GERMLINE_BLOCK),
      germlineAccess: checkAccess(userGroups, GERMLINE_ACCESS, GERMLINE_BLOCK),
      managerAccess,
      nonproductionAccess: checkAccess(userGroups, NONPRODUCTION_ACCESS, NONPRODUCTION_ACCESS_BLOCK),
      nonproductionStates: NONPRODUCTION_STATES,
      reportAssignmentAccess: checkAccess(userGroups, [...REPORT_ASSIGNMENT_ACCESS], ADMIN_BLOCK),
      // Manager (or admin) can both edit reports and see the settings page
      reportEditAccess: managerAccess,
      reportSettingAccess: managerAccess,
      reportsAccess: checkAccess(userGroups, REPORTS_ACCESS, REPORTS_BLOCK),
      templateEditAccess: checkAccess(userGroups, [...TEMPLATE_EDIT_ACCESS], GERMLINE_BLOCK),
      unreviewedAccess: checkAccess(userGroups, UNREVIEWED_ACCESS, UNREVIEWED_ACCESS_BLOCK),
      unreviewedStates: UNREVIEWED_STATES,
      variantTextEditAccess: checkAccess(userGroups, [...ADMIN_ACCESS, 'variant-text edit access'], ADMIN_BLOCK),
    };
  }, [groups]);
};

const ResourceContext = createContext<ResourceContextType>({
  adminAccess: false,
  allProjectsAccess: false,
  allStates: ALL_STATES,
  appendixEditAccess: false,
  germlineAccess: false,
  managerAccess: false,
  nonproductionAccess: false,
  nonproductionStates: NONPRODUCTION_STATES,
  reportAssignmentAccess: false,
  reportEditAccess: false,
  reportSettingAccess: false,
  reportsAccess: false,
  templateEditAccess: false,
  unreviewedAccess: false,
  unreviewedStates: UNREVIEWED_STATES,
  variantTextEditAccess: false,
});

type ResourceContextProviderProps = {
  children: ReactChild,
};

const ResourceContextProvider = ({ children }: ResourceContextProviderProps): JSX.Element => {
  const {
    adminAccess,
    allProjectsAccess,
    allStates,
    appendixEditAccess,
    germlineAccess,
    managerAccess,
    nonproductionAccess,
    nonproductionStates,
    reportAssignmentAccess,
    reportEditAccess,
    reportSettingAccess,
    reportsAccess,
    templateEditAccess,
    unreviewedAccess,
    unreviewedStates,
    variantTextEditAccess,
  } = useResources();

  const providerValue = useMemo(() => ({
    adminAccess,
    allProjectsAccess,
    allStates,
    appendixEditAccess,
    germlineAccess,
    managerAccess,
    nonproductionAccess,
    nonproductionStates,
    reportAssignmentAccess,
    reportEditAccess,
    reportSettingAccess,
    reportsAccess,
    templateEditAccess,
    unreviewedAccess,
    unreviewedStates,
    variantTextEditAccess,
  }), [
    adminAccess,
    allProjectsAccess,
    allStates,
    appendixEditAccess,
    germlineAccess,
    managerAccess,
    nonproductionAccess,
    nonproductionStates,
    reportAssignmentAccess,
    reportEditAccess,
    reportSettingAccess,
    reportsAccess,
    templateEditAccess,
    unreviewedAccess,
    unreviewedStates,
    variantTextEditAccess,
  ]);

  return (
    <ResourceContext.Provider value={providerValue}>
      {children}
    </ResourceContext.Provider>
  );
};

export type {
  ResourceContextType,
};

export {
  ResourceContextProvider,
};

export default ResourceContext;
