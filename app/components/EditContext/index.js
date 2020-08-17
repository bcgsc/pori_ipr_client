import React from 'react';

const EditContext = React.createContext({
  canEdit: false,
  setCanEdit: () => {},
});

export default EditContext;
