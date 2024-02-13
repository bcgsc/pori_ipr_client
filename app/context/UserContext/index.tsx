import React, {
  createContext, ReactChild, useMemo, useContext,
} from 'react';
import useSecurity from '@/hooks/useSecurity';
import { checkAccess } from '@/utils/checkAccess';
import UserContextInterface from './interfaces';

const EDIT_ACCESS = ['admin', 'analyst', 'bioinformatician', 'projects', 'manager'];
const EDIT_BLOCK = ['clinician', 'collaborator'];

const UserContext = createContext<UserContextInterface>({
  canEdit: false,
  isAdmin: false,
});

type UserContextProviderProps = {
  children: ReactChild,
};

const UserContextProvider = ({ children }: UserContextProviderProps): JSX.Element => {
  const { userDetails } = useSecurity();

  const canEdit = useMemo(() => {
    if (userDetails && checkAccess(userDetails.groups, EDIT_ACCESS, EDIT_BLOCK)) {
      return true;
    }
    return false;
  }, [userDetails]);

  const isAdmin = useMemo(() => {
    if (!userDetails?.groups) { return false; }
    return userDetails?.groups?.map((g) => g.name.toLowerCase()).includes('admin');
  }, [userDetails?.groups]);

  const contextValue = useMemo(() => ({
    canEdit,
    isAdmin,
  }), [canEdit, isAdmin]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

const useUser = (): UserContextInterface => useContext(UserContext);

export type {
  UserContextInterface,
};

export {
  UserContextProvider,
  useUser,
};

export default UserContext;
