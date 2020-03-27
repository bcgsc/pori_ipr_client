import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Button,
} from '@material-ui/core';
import { HighlightOff } from '@material-ui/icons';
import DataTable from '../..';
import geneViewerApi from '../../../../services/reports/geneViewer';

/**
 * @param {object} props props
 * @param {func} props.onClose parent close handler
 * @param {object} props.selectedRow current row object
 * @param {bool} props.open is open?
 * @return {*} JSX
 */
function GeneViewer(props) {
  const {
    onClose,
    open,
    gene,
    reportId,
  } = props;
  
  const [geneData, setGeneData] = useState();

  const handleClose = (value) => {
    onClose(value);
  };

  useEffect(() => {
    if (open) {
      const api = async () => {
        const resp = await geneViewerApi(gene, reportId);
        setGeneData(resp);
      };
      api();
    }
  }, [open]);

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      maxWidth="xl"
      fullWidth
    >
      <DialogTitle>
        <span className="dialog__title">
          <Typography variant="h6" align="center">
            Gene Viewer
          </Typography>
          <IconButton onClick={handleClose}>
            <HighlightOff />
          </IconButton>
        </span>
      </DialogTitle>
      <DialogContent>
        test
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

GeneViewer.propTypes = {
  onClose: PropTypes.func.isRequired,
  gene: PropTypes.any.isRequired,
  reportId: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
};

export default GeneViewer;
