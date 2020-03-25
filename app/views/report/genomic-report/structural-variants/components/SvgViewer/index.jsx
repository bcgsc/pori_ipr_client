import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
} from '@material-ui/core';

/**
 * 
 */
function SvgViewer(props) {
  const {
    open,
    selectedRow,
    onClose,
  } = props;

  const handleClose = (value) => {
    onClose(value);
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>
        Fusion Diagram
      </DialogTitle>
    </Dialog>
  );
}

export default SvgViewer;
