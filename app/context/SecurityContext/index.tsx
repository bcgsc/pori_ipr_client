import { UserType } from '@/common';
import React from 'react';

type SecurityContextType = {
  authorizationToken: string;
  setAuthorizationToken: (token: string) => void;
  userDetails: UserType;
  setUserDetails: (userDetails: UserType) => void;
};

const SecurityContext = React.createContext<SecurityContextType>({
  authorizationToken: '',
  setAuthorizationToken: () => {},
  userDetails: null,
  setUserDetails: () => {},
});

export default SecurityContext;

export {
  SecurityContextType,
  SecurityContext,
};
