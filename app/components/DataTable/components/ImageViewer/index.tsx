import React, { useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';

import Image, { ImageType } from '@/components/Image';

import './index.scss';

type ImageDataProp = { image: ImageType } | { image: ImageType[] };

type ImageViewerProps = {
  /** Handles dialog close */
  onClose: () => void;
  /** Row object selected from table */
  selectedRow: ImageDataProp,
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

  let renderedImage;
  if (selectedRow.image) {
    if (Array.isArray(selectedRow.image)) {
      renderedImage = selectedRow.image.map((img) => (
        <Image
          image={img}
          showTitle
          showCaption
          isZoomable={false}
        />
      ));
    } else {
      renderedImage = (
        <Image
          image={selectedRow.image}
          showTitle
          showCaption
          isZoomable={false}
        />
      );
    }
  }

  return (
    <Dialog
      onClose={handleClose}
      open={isOpen}
      maxWidth="xl"
    >
      <DialogContent>
        {renderedImage}
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
