import React, { useState, useCallback } from 'react';
import { IconButton } from '@material-ui/core';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

import InfoDialog from '../InfoDialog';

import './index.scss';

type EvidenceHeaderProps = {
  displayName: string,
}

const EvidenceHeader = ({ displayName }: EvidenceHeaderProps): JSX.Element => {
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
      <IconButton className="evidence__button" size="small" onClick={handleClick}>
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
