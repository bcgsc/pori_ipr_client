import React, {
  createContext, ReactChild, useState, useEffect, useMemo,
} from 'react';
import { checkAccess, ALL_ROLES } from '@/utils/checkAccess';
import useSecurity from '@/hooks/useSecurity';
import ResourceContextType from './types';

const GERMLINE_ACCESS = ['admin', 'analyst', 'bioinformatician', 'projects', 'manager'];
const GERMLINE_BLOCK = ALL_ROLES;
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
        setReportSettingAccess(true);
        setReportEditAccess(true);
      }
    }
  }, [groups]);

  return {
    germlineAccess,
    reportsAccess,
    adminAccess,
    reportSettingAccess,
    reportEditAccess,
  };
};

const ResourceContext = createContext<ResourceContextType>({
  germlineAccess: false,
  reportsAccess: false,
  adminAccess: false,
  reportSettingAccess: false,
  reportEditAccess: false,
});

type ResourceContextProviderProps = {
  children: ReactChild,
};

const ResourceContextProvider = ({ children }: ResourceContextProviderProps): JSX.Element => {
  const {
    germlineAccess, reportsAccess, adminAccess, reportSettingAccess, reportEditAccess,
  } = useResources();

  const providerValue = useMemo(() => ({
    germlineAccess,
    reportsAccess,
    adminAccess,
    reportSettingAccess,
    reportEditAccess,
  }), [
    germlineAccess,
    reportsAccess,
    adminAccess,
    reportSettingAccess,
    reportEditAccess,
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
