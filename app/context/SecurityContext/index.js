import React from 'react';

const SecurityContext = React.createContext({
  authorizationToken: '',
  setAuthorizationToken: () => {},
  userDetails: '',
  setUserDetails: () => {},
});

export default SecurityContext;
