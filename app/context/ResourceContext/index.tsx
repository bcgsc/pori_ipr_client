import React, {
  createContext, ReactChild, useState, useEffect, useMemo,
} from 'react';
import { checkAccess, ALL_ROLES } from '@/utils/checkAccess';
import useSecurity from '@/hooks/useSecurity';
import ResourceContextType from './types';

const GERMLINE_ACCESS = ['admin', 'manager', 'germline access'];
const UNREVIEWED_ACCESS = ['admin', 'manager', 'report manager', 'bioinformatician', 'unreviewed access'];
const NONPRODUCTION_ACCESS = ['admin', 'manager', 'bioinformatician', 'non-production access'];
const TEMPLATE_EDIT_ACCESS = ['admin', 'manager', 'template edit access'];
const APPENDIX_EDIT_ACCESS = ['admin', 'manager', 'appendix edit access'];

const GERMLINE_BLOCK = ALL_ROLES;
const UNREVIEWED_ACCESS_BLOCK = [];
const NONPRODUCTION_ACCESS_BLOCK = [];

const ALL_STATES = ['signedoff', 'nonproduction', 'uploaded', 'reviewed', 'completed', 'ready', 'active'];
const UNREVIEWED_STATES = ['uploaded', 'ready', 'active']; // TODO decide if nonproduction should go in unreviewed as well
const NONPRODUCTION_STATES = ['nonproduction'];

const REPORTS_ACCESS = ['*'];
const REPORTS_BLOCK = [];
const ADMIN_ACCESS = ['admin'];
const ADMIN_BLOCK = ALL_ROLES;

const useResources = (): ResourceContextType => {
  const { userDetails: { groups } } = useSecurity();

  const [germlineAccess, setGermlineAccess] = useState(false);
  const [reportsAccess, setReportsAccess] = useState(false);
  const [reportEditAccess, setReportEditAccess] = useState(false);
  const [adminAccess, setAdminAccess] = useState(false);
  const [managerAccess, setManagerAccess] = useState(false);
  const [reportSettingAccess, setReportSettingAccess] = useState(false);
  const [unreviewedAccess, setUnreviewedAccess] = useState(false);
  const [nonproductionAccess, setNonproductionAccess] = useState(false);
  const [templateEditAccess, setTemplateEditAccess] = useState(false);
  const [appendixEditAccess, setAppendixEditAccess] = useState(false);

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

      if (checkAccess(groups, [...ADMIN_ACCESS, 'manager'], ADMIN_BLOCK)) {
        setManagerAccess(true);
      }

      if (checkAccess(groups, [...TEMPLATE_EDIT_ACCESS], REPORTS_BLOCK)) {
        setTemplateEditAccess(true);
      }

      if (checkAccess(groups, [...APPENDIX_EDIT_ACCESS], REPORTS_BLOCK)) {
        setAppendixEditAccess(true);
      }

      if (checkAccess(groups, [...ADMIN_ACCESS, 'manager', 'report manager'], ADMIN_BLOCK)) {
        setReportSettingAccess(true);
        setReportEditAccess(true);
      }
      if (checkAccess(groups, UNREVIEWED_ACCESS, UNREVIEWED_ACCESS_BLOCK)) {
        setUnreviewedAccess(true);
      }
      if (checkAccess(groups, NONPRODUCTION_ACCESS, NONPRODUCTION_ACCESS_BLOCK)) {
        setNonproductionAccess(true);
      }

    }
  }, [groups]);

  return {
    germlineAccess,
    reportsAccess,
    adminAccess,
    managerAccess,
    reportSettingAccess,
    reportEditAccess,
    unreviewedAccess,
    nonproductionAccess,
    templateEditAccess,
    appendixEditAccess,
    allStates: ALL_STATES,
    unreviewedStates: UNREVIEWED_STATES,
    nonproductionStates: NONPRODUCTION_STATES,
  };
};

const ResourceContext = createContext<ResourceContextType>({
  germlineAccess: false,
  reportsAccess: false,
  adminAccess: false,
  managerAccess: false,
  reportSettingAccess: false,
  reportEditAccess: false,
  unreviewedAccess: false,
  nonproductionAccess: false,
  templateEditAccess: false,
  appendixEditAccess: false,
  allStates: ALL_STATES,
  unreviewedStates: UNREVIEWED_STATES,
  nonproductionStates: NONPRODUCTION_STATES,
});

type ResourceContextProviderProps = {
  children: ReactChild,
};

const ResourceContextProvider = ({ children }: ResourceContextProviderProps): JSX.Element => {
  const {
    germlineAccess, reportsAccess, adminAccess, managerAccess, reportSettingAccess, reportEditAccess, unreviewedAccess, nonproductionAccess,
    templateEditAccess,
    appendixEditAccess,
    allStates,
    unreviewedStates,
    nonproductionStates,
  } = useResources();

  const providerValue = useMemo(() => ({
    germlineAccess,
    reportsAccess,
    adminAccess,
    managerAccess,
    reportSettingAccess,
    reportEditAccess,
    unreviewedAccess,
    nonproductionAccess,
    templateEditAccess,
    appendixEditAccess,
    allStates,
    unreviewedStates,
    nonproductionStates,
  }), [
    germlineAccess,
    reportsAccess,
    adminAccess,
    managerAccess,
    reportSettingAccess,
    reportEditAccess,
    unreviewedAccess,
    nonproductionAccess,
    templateEditAccess,
    appendixEditAccess,
    allStates,
    unreviewedStates,
    nonproductionStates,
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
