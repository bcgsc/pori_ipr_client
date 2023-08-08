import { useState, useEffect, useContext } from 'react';

import SecurityContext from '@/context/SecurityContext';

const EXTERNAL_GROUPS = ['clinician', 'collaborator'];

const useExternalMode = (): boolean => {
  const { userDetails } = useContext(SecurityContext);

  const [isExternalMode, setIsExternalMode] = useState<boolean>(null);

  useEffect(() => {
    if (userDetails) {
      if (userDetails.groups.some((g) => EXTERNAL_GROUPS.includes(g.name))) {
        setIsExternalMode(true);
      } else {
        setIsExternalMode(false);
      }
    }
  }, [userDetails]);

  return isExternalMode;
};

export default useExternalMode;
