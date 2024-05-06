// TODO delete this and replace with nonprod and unreviewed access checks (and germline)

import { useState, useEffect } from 'react';
import useSecurity from '@/hooks/useSecurity';

const EXTERNAL_GROUPS = ['clinician', 'collaborator'];

const useExternalMode = (): boolean => {
  const { userDetails } = useSecurity();

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
