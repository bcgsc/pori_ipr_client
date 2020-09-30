import React from 'react';

const ConfirmContext = React.createContext({
  showConfirm: false,
  setShowConfirm: () => {},
  apiCalls: [],
  setApiCalls: () => () => {},
  isSigned: false,
  setIsSigned: () => {},
});

export default ConfirmContext;
