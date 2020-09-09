import React from 'react';

interface EditContextInterface {
  /** Can the current user make edits */
  canEdit: Boolean,
  /** Update current user edit status */
  setCanEdit: Function,
}

const EditContext = React.createContext<EditContextInterface>({
  canEdit: false,
  setCanEdit: () => {},
});

export default EditContext;
