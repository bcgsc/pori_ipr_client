import { useState, useEffect, useContext } from 'react';

import SecurityContext from '@/context/SecurityContext';
import checkAccess from '@/utils/checkAccess';

const GERMLINE_ACCESS = ['admin', 'analyst', 'bioinformatician', 'projects', 'manager'];
const GERMLINE_BLOCK = ['clinician', 'collaborator'];
const REPORT_ACCESS = ['*'];
const REPORT_BLOCK = [];
const ADMIN_ACCESS = ['admin'];
const ADMIN_BLOCK = [];

type UseResourcesReturnType = {
  germlineAccess: boolean;
  reportAccess: boolean;
  adminAccess: boolean;
};

const useResources = (): UseResourcesReturnType => {
  const { userDetails } = useContext(SecurityContext);

  const [germlineAccess, setGermlineAccess] = useState(false);
  const [reportAccess, setReportAccess] = useState(false);
  const [adminAccess, setAdminAccess] = useState(false);

  useEffect(() => {
    if (userDetails) {
      if (checkAccess(userDetails.groups, GERMLINE_ACCESS, GERMLINE_BLOCK)) {
        setGermlineAccess(true);
      }

      if (checkAccess(userDetails.groups, REPORT_ACCESS, REPORT_BLOCK)) {
        setReportAccess(true);
      }

      if (checkAccess(userDetails.groups, ADMIN_ACCESS, ADMIN_BLOCK)) {
        setAdminAccess(true);
      }
    }
  }, [userDetails]);

  return { germlineAccess, reportAccess, adminAccess };
};

export default useResources;
