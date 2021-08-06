import { useState, useEffect, useContext } from 'react';

import SecurityContext from '@/context/SecurityContext';
import checkAccess from '@/utils/checkAccess';

const EXTERNAL_GROUPS = ['clinician', 'collaborator', 'external analyst'];

const useExternalMode = (): boolean => {
  const { userDetails } = useContext(SecurityContext);

  const [isExternalMode, setIsExternalMode] = useState<boolean>();

  useEffect(() => {
    if (userDetails) {
      if (!checkAccess(userDetails.groups, EXTERNAL_GROUPS, [])) {
        setIsExternalMode(false);
      } else {
        setIsExternalMode(true);
      }
    }
  }, [userDetails]);

  return isExternalMode;
};

export default useExternalMode;
