import React, { createContext, ReactChild, useContext } from 'react';

import useActions from '@/hooks/useActions';
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

const useEdit = (): EditContextInterface => useContext(EditContext);

export {
  EditContextProvider,
  useEdit,
};

export default EditContext;
