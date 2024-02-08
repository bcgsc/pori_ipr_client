import { UserType } from '@/common';
import React from 'react';

type SecurityContextType = {
  authorizationToken: string;
  setAuthorizationToken: (token: string) => void;
  userDetails: Partial<UserType>;
  setUserDetails: (userDetails: UserType) => void;
};

const SecurityContext = React.createContext<SecurityContextType>({
  authorizationToken: '',
  setAuthorizationToken: () => {},
  userDetails: {
    firstName: null,
    lastName: null,
    username: null,
  },
  setUserDetails: () => {},
});

export default SecurityContext;

export {
  SecurityContextType,
  SecurityContext,
};
