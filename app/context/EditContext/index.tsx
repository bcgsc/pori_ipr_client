import React, { createContext, ReactChild } from 'react';

import { useActions } from '@/hooks/useEdit';
import EditContextInterface from './interfaces';

const EditContext = createContext<EditContextInterface>({
  canEdit: false,
});

type EditContextProviderProps = {
  children: ReactChild,
};

const EditContextProvider = ({ children }: EditContextProviderProps): JSX.Element => {
  const { canEdit } = useActions();

  return (
    <EditContext.Provider value={{ canEdit }}>
      {children}
    </EditContext.Provider>
  );
};

export type {
  EditContextInterface,
};

export {
  EditContextProvider,
}

export default EditContext;
