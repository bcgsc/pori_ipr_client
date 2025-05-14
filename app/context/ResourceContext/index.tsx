import React, {
  createContext, ReactChild, useState, useEffect, useMemo,
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

  const [germlineAccess, setGermlineAccess] = useState(false);
  const [reportsAccess, setReportsAccess] = useState(false);
  /**
   * Is the user allowed to edit the report
   */
  const [reportEditAccess, setReportEditAccess] = useState(false);
  /**
   * Is the user allowed to assign users to the report
   */
  const [reportAssignmentAccess, setReportAssignmentAccess] = useState(false);
  const [adminAccess, setAdminAccess] = useState(false);
  const [allProjectsAccess, setAllProjectsAccess] = useState(false);
  const [managerAccess, setManagerAccess] = useState(false);
  /**
   * Is the user allowed to see the settings page
   */
  const [reportSettingAccess, setReportSettingAccess] = useState(false);
  const [unreviewedAccess, setUnreviewedAccess] = useState(false);
  const [nonproductionAccess, setNonproductionAccess] = useState(false);
  const [templateEditAccess, setTemplateEditAccess] = useState(false);
  const [appendixEditAccess, setAppendixEditAccess] = useState(false);
  const [variantTextEditAccess, setVariantTextEditAccess] = useState(false);

  // Check user group first to see which resources they can access
  useEffect(() => {
    if (groups) {
      if (checkAccess(groups, GERMLINE_ACCESS, GERMLINE_BLOCK)) {
        setGermlineAccess(true);
      }

      if (checkAccess(groups, REPORTS_ACCESS, REPORTS_BLOCK)) {
        setReportsAccess(true);
      }

      if (checkAccess(groups, ADMIN_ACCESS, ADMIN_BLOCK)) {
        setAdminAccess(true);
      }

      if (checkAccess(groups, [...ADMIN_ACCESS, 'all projects access'], ADMIN_BLOCK)) {
        setAllProjectsAccess(true);
      }

      if (checkAccess(groups, [...ADMIN_ACCESS, 'manager'], ADMIN_BLOCK)) {
        setManagerAccess(true);
      }

      if (checkAccess(groups, [...TEMPLATE_EDIT_ACCESS], GERMLINE_BLOCK)) {
        setTemplateEditAccess(true);
      }

      if (checkAccess(groups, [...APPENDIX_EDIT_ACCESS], GERMLINE_BLOCK)) {
        setAppendixEditAccess(true);
      }

      if (checkAccess(groups, [...ADMIN_ACCESS, 'manager'], ADMIN_BLOCK)) {
        setReportSettingAccess(true);
        setReportEditAccess(true);
      }

      if (checkAccess(groups, [...REPORT_ASSIGNMENT_ACCESS], ADMIN_BLOCK)) {
        setReportAssignmentAccess(true);
      }

      if (checkAccess(groups, UNREVIEWED_ACCESS, UNREVIEWED_ACCESS_BLOCK)) {
        setUnreviewedAccess(true);
      }

      if (checkAccess(groups, NONPRODUCTION_ACCESS, NONPRODUCTION_ACCESS_BLOCK)) {
        setNonproductionAccess(true);
      }

      if (checkAccess(groups, [...ADMIN_ACCESS, 'variant-text edit access'], ADMIN_BLOCK)) {
        setVariantTextEditAccess(true);
      }
    }
  }, [groups]);

  return {
    adminAccess,
    allProjectsAccess,
    allStates: ALL_STATES,
    appendixEditAccess,
    germlineAccess,
    managerAccess,
    nonproductionAccess,
    nonproductionStates: NONPRODUCTION_STATES,
    reportAssignmentAccess,
    reportEditAccess,
    reportSettingAccess,
    reportsAccess,
    templateEditAccess,
    unreviewedAccess,
    unreviewedStates: UNREVIEWED_STATES,
    variantTextEditAccess,
  };
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
