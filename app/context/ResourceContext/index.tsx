import React, {
  createContext, ReactChild, useState, useEffect, useMemo,
} from 'react';
import { checkAccess, ALL_ROLES } from '@/utils/checkAccess';
import useSecurity from '@/hooks/useSecurity';
import ResourceContextType from './types';

// TODO: determine whether bioinformaticians need nonprod or germline access;
// determine whether report managers do
// TODO: rename bioinformatician role?
const GERMLINE_ACCESS = ['admin', 'manager', 'bioinformatician', 'Germline Access'];
const UNREVIEWED_ACCESS = ['admin', 'manager', 'report-manager', 'bioinformatician', 'Unreviewed Access'];
const NONPRODUCTION_ACCESS = ['admin', 'manager', 'bioinformatician', 'non-production access'];

const GERMLINE_BLOCK = ALL_ROLES;
const UNREVIEWED_ACCESS_BLOCK = [];
const NONPRODUCTION_ACCESS_BLOCK = [];
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
  const [reportSettingAccess, setReportSettingAccess] = useState(false);
  const [unreviewedAccess, setUnreviewedAccess] = useState(false);
  const [nonproductionAccess, setNonproductionAccess] = useState(false);

  // Check user group first to see which resources they can access
  useEffect(() => {
    console.log('at 26');
    console.dir(groups);
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

      if (checkAccess(groups, [...ADMIN_ACCESS, 'manager', 'Report Manager'], ADMIN_BLOCK)) {
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
    reportSettingAccess,
    reportEditAccess,
    unreviewedAccess,
    nonproductionAccess,
  };
};

const ResourceContext = createContext<ResourceContextType>({
  germlineAccess: false,
  reportsAccess: false,
  adminAccess: false,
  reportSettingAccess: false,
  reportEditAccess: false,
  unreviewedAccess: false,
  nonproductionAccess: false,
});

type ResourceContextProviderProps = {
  children: ReactChild,
};

const ResourceContextProvider = ({ children }: ResourceContextProviderProps): JSX.Element => {
  const {
    germlineAccess, reportsAccess, adminAccess, reportSettingAccess, reportEditAccess, unreviewedAccess, nonproductionAccess,
  } = useResources();

  const providerValue = useMemo(() => ({
    germlineAccess,
    reportsAccess,
    adminAccess,
    reportSettingAccess,
    reportEditAccess,
    unreviewedAccess,
    nonproductionAccess,
  }), [
    germlineAccess,
    reportsAccess,
    adminAccess,
    reportSettingAccess,
    reportEditAccess,
    unreviewedAccess,
    nonproductionAccess,
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
