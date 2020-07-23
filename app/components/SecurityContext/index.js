import React from 'react';

const SecurityContext = React.createContext({
  authenticationToken: '',
  setAuthenticationToken: () => {},
  userDetails: '',
  setUserDetails: () => {},
  adminUser: '',
  setAdminUser: () => {},
});

export default SecurityContext;
