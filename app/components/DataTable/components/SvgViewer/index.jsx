import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from '@material-ui/core';
import { UncontrolledReactSVGPanZoom } from 'react-svg-pan-zoom';
import InlineSVG from 'svg-inline-react';
import AutoSizer from 'react-virtualized/dist/es/AutoSizer';
import DataTable from '../..';
import columnDefs, { setHeaderName } from './columnDefs';

import './index.scss';

const getFrameText = (frame) => {
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

/**
 * @param {object} props props
 * @param {func} props.onClose parent close handler
 * @param {object} props.selectedRow current row object
 * @param {bool} props.open is open?
 * @return {*} JSX
 */
function SvgViewer(props) {
  const {
    onClose,
    selectedRow,
    open,
  } = props;

  const [svgSize, setSvgSize] = useState({
    height: 500,
    width: 500,
  });
  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    if (selectedRow.svg) {
      const svg = new DOMParser().parseFromString(selectedRow.svg, 'image/svg+xml');
      const [svgElem] = svg.getElementsByTagName('svg');
      setSvgSize({
        height: svgElem.height.baseVal.value,
        width: svgElem.width.baseVal.value,
      });

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

  const handleClose = (value) => {
    onClose(value);
  };

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      maxWidth="xl"
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
          <AutoSizer disableHeight>
            {({ width }) => (
              <UncontrolledReactSVGPanZoom
                width={width}
                height={svgSize.height}
                background="#FFFFFF"
                detectAutoPan={false}
                customMiniature={() => null}
                toolbarProps={{ position: 'left' }}
              >
                <svg width={svgSize.width} height={svgSize.height}>
                  <InlineSVG src={selectedRow.svg} raw />
                </svg>
              </UncontrolledReactSVGPanZoom>
            )}
          </AutoSizer>
        )}
        <DataTable
          columnDefs={columnDefs}
          rowData={rowData}
          canViewDetails={false}
        />
        <Typography>
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
}

SvgViewer.propTypes = {
  onClose: PropTypes.func.isRequired,
  selectedRow: PropTypes.objectOf(PropTypes.any).isRequired,
  open: PropTypes.bool.isRequired,
};

export default SvgViewer;
