import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import Image from '@/components/Image';
import { SelectedRow } from './interfaces';

import './index.scss';

interface Props {
  /** Handles dialog close */
  onClose: () => void;
  /** Row object selected from table */
  selectedRow: SelectedRow,
  /** Dialog open state */
  isOpen: boolean;
}

const ImageViewer = ({ onClose, selectedRow, isOpen }: Props): JSX.Element => {
  const handleClose = (): void => {
    onClose();
  };

  return (
    <Dialog
      onClose={handleClose}
      open={isOpen}
      maxWidth="xl"
    >
      <DialogContent>
        {selectedRow.image && (
          <Image
            image={selectedRow.image}
            showTitle
            showCaption
            isZoomable={false}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageViewer;
