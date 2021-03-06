import React from 'react';

type ConfirmContextType = {
  isSigned: boolean;
  setIsSigned: (isSigned: boolean) => void;
};

const ConfirmContext = React.createContext<ConfirmContextType>({
  isSigned: false,
  setIsSigned: (isSigned) => {},
});

export default ConfirmContext;
