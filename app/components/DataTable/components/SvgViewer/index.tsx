import React, { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from '@mui/material';
import { AgGridReact } from '@ag-grid-community/react';

import SvgImage from '@/components/SvgImage';
import { StructuralVariantType } from '@/common';
import EnsemblCellRenderer from '../EnsemblCellRenderer';
import columnDefs, { setHeaderName } from './columnDefs';

import './index.scss';

const getFrameText = (frame: string): string => {
  switch (frame) {
    case 'OUT':
      return 'Out of frame';
    case 'IN':
      return 'In frame';
    case 'UNDET':
      return 'Not Determined';
    default:
      return 'N/A';
  }
};

type SvgViewerProps = {
  onClose: () => void;
  selectedRow: Partial<StructuralVariantType>;
  isOpen: boolean;
};

const SvgViewer = ({
  onClose,
  selectedRow,
  isOpen,
}: SvgViewerProps): JSX.Element => {
  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    if (selectedRow.svg) {
      setRowData([{
        ...selectedRow,
        position: '5`',
        gene: selectedRow.gene1.name,
        ensemblGene: selectedRow.ntermGene,
        ensemblTranscript: selectedRow.ntermTranscript,
        exon: selectedRow.exon1,
        breakpoint: selectedRow.breakpoint.split('|')[0],
      }, {
        ...selectedRow,
        position: '3`',
        gene: selectedRow.gene2.name,
        ensemblGene: selectedRow.ctermGene,
        ensemblTranscript: selectedRow.ctermTranscript,
        exon: selectedRow.exon2,
        breakpoint: selectedRow.breakpoint.split('|')[1],
      }]);

      setHeaderName(`Gene: ${selectedRow.gene1.name} :: ${selectedRow.gene2.name}`, 'geneHeader');
      setHeaderName(`Type: ${selectedRow.eventType}`, 'ensemblHeader');
      setHeaderName(`Predicted: ${getFrameText(selectedRow.frame)}`, 'predictedHeader');
    }
  }, [selectedRow]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Dialog
      onClose={handleClose}
      open={isOpen}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <span className="dialog__title">
          <Typography variant="h5" align="center">
            Structural Variant Details
          </Typography>
        </span>
      </DialogTitle>
      <DialogContent>
        {selectedRow.svg && (
          <SvgImage
            image={selectedRow.svg}
          />
        )}
        <div className="ag-theme-material">
          <AgGridReact
            columnDefs={columnDefs}
            rowData={rowData}
            domLayout="autoHeight"
            frameworkComponents={{
              EnsemblCellRenderer,
            }}
          />
        </div>
        <Typography variant="body2">
          {selectedRow.svgTitle}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SvgViewer;
