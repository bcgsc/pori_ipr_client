import { useState, useEffect, useContext } from 'react';

import SecurityContext from '@/context/SecurityContext';

const EDIT_BLACKLIST = ['clinician', 'colaborator'];

type UseActionsReturnType = {
  canEdit: boolean;
};

const useActions = (): UseActionsReturnType => {
  const { userDetails } = useContext(SecurityContext);

  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    if (userDetails) {
      if (!userDetails.groups.some((group) => EDIT_BLACKLIST.includes(group.name))) {
        setCanEdit(true);
      }
    }
  }, [userDetails]);

  return { canEdit };
};

export default useActions;
