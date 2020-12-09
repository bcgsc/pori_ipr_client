import React, { useState, useCallback } from 'react';
import { IconButton } from '@material-ui/core';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

import InfoDialog from '../InfoDialog';

const EvidenceHeader = (params) => {
  const {
    displayName,
  } = params;

  const [showDialog, setShowDialog] = useState<boolean>(false);

  const handleClick = useCallback(() => {
    if (!showDialog) {
      setShowDialog(true);
    }
  }, [showDialog]);

  const handleClose = () => {
    setShowDialog(false);
  };

  return (
    <span>
      {displayName}
      <IconButton size="small" onClick={handleClick}>
        <HelpOutlineIcon />
      </IconButton>
      <InfoDialog
        isOpen={showDialog}
        onClose={handleClose}
      />
    </span>
  );
};

export default EvidenceHeader;
