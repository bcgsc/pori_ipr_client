/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';

const SecurityContext = React.createContext({
  authorizationToken: '',
  setAuthorizationToken: () => {},
  userDetails: '',
  setUserDetails: () => {},
  adminUser: '',
  setAdminUser: () => {},
});

export default SecurityContext;
