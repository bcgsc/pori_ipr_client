import React, { useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';

import Image, { ImageType } from '@/components/Image';

import './index.scss';

type ImageViewerProps = {
  /** Handles dialog close */
  onClose: () => void;
  /** Row object selected from table */
  selectedRow: { image: ImageType },
  /** Dialog open state */
  isOpen: boolean;
};

const ImageViewer = ({
  onClose,
  selectedRow,
  isOpen,
}: ImageViewerProps): JSX.Element => {
  const handleClose = useCallback((): void => {
    onClose();
  }, [onClose]);

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
