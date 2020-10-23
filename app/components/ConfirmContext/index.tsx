import React from 'react';

const ConfirmContext = React.createContext({
  isSigned: false,
  setIsSigned: () => {},
});

export default ConfirmContext;
