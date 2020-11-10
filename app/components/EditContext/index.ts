/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';
import EditContextInterface from './interfaces';

const EditContext = React.createContext<EditContextInterface>({
  canEdit: false,
  setCanEdit: () => {},
});

export default EditContext;
