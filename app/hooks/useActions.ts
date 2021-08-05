import { useState, useEffect, useContext } from 'react';

import SecurityContext from '@/context/SecurityContext';
import checkAccess from '@/utils/checkAccess';

const EDIT_ACCESS = ['*'];
const EDIT_BLOCK = ['clinician', 'colaborator'];

type UseActionsReturnType = {
  canEdit: boolean;
};

const useActions = (): UseActionsReturnType => {
  const { userDetails } = useContext(SecurityContext);

  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    if (userDetails) {
      if (checkAccess(userDetails.groups, EDIT_ACCESS, EDIT_BLOCK)) {
        setCanEdit(true);
      }
    }
  }, [userDetails]);

  return { canEdit };
};

export default useActions;
