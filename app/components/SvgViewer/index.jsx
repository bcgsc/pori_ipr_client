import React, {
  useEffect, useState, useRef, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
} from '@material-ui/core';
import { UncontrolledReactSVGPanZoom, fitToViewer } from 'react-svg-pan-zoom';
import InlineSVG from 'svg-inline-react';
import { AutoSizer } from 'react-virtualized';
import DataTable from '../DataTable';

/**
 * 
 * @param {*} props 
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

  const [viewer, setViewer] = useState();

  // useEffect(() => {
  //   if (viewer) {
  //     console.log(viewer);
  //     viewer.fitToViewer('left', 'top');
  //   }
  // }, [viewer]);

  useEffect(() => {
    if (selectedRow.svg) {
      const svg = new DOMParser().parseFromString(selectedRow.svg, 'image/svg+xml');
      const [svgElem] = svg.getElementsByTagName('svg');
      setSvgSize({
        height: svgElem.height.baseVal.value,
        width: svgElem.width.baseVal.value,
      });
    }
  }, [selectedRow]);

  const handleClose = (value) => {
    onClose(value);
  };

  const getFrameText = () => {
    switch (selectedRow.frame) {
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

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      maxWidth="xl"
      fullWidth
    >
      <DialogTitle>
        Structural Variant Details
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
                ref={setViewer}
              >
                <svg width={svgSize.width} height={svgSize.height}>
                  <InlineSVG src={selectedRow.svg} raw />
                </svg>
              </UncontrolledReactSVGPanZoom>
            )}
          </AutoSizer>
        )}
        <Typography>
          {selectedRow.svgTitle}
        </Typography>
      </DialogContent>
    </Dialog>
  );
}

SvgViewer.propTypes = {
  onClose: PropTypes.func.isRequired,
  selectedRow: PropTypes.objectOf(PropTypes.any).isRequired,
  open: PropTypes.bool.isRequired,
};

export default SvgViewer;
