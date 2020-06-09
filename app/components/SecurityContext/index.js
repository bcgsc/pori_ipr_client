import React from 'react';

const SecurityContext = React.createContext({
  authenticationToken: '',
  setAuthenticationToken: () => {},
});

export default SecurityContext;
