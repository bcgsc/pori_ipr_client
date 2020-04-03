import React, { useState } from 'react';
import {
  IconButton, Tooltip,
} from '@material-ui/core';
import {
  Edit,
  Photo,
  LibraryBooks,
} from '@material-ui/icons';
import DetailDialog from '../DetailDialog';
import SvgViewer from '../SvgViewer';

/**
 * @param {object} params params
 * @param {string} params.value display text
 * @param {string} props.link target link
 * @return {*} JSX
 */
function ActionCellRenderer(params) {
  const {
    data,
    context: {
      editable,
      canViewDetails,
      EditDialog,
      reportIdent,
      tableType,
      arrayColumns,
    },
    node,
  } = params;

  const [detailData, setDetailData] = useState({});
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showSvgViewer, setShowSvgViewer] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const detailClick = () => {
    const propagateObject = Object.entries(data).reduce((accumulator, [key, value]) => {
      if (typeof value !== 'object') {
        accumulator[key] = value;
      }
      return accumulator;
    }, {});

    setDetailData(propagateObject);
    setShowDetailDialog(true);
  };

  const handleDetailClose = () => {
    setShowDetailDialog(false);
  };

  const handleSvgViewerClose = () => {
    setShowSvgViewer(false);
  };

  const handleRowEditClose = (editedData) => {
    setShowEditDialog(false);
    if (editedData && node) {
      node.setData(editedData);
    }
  };

  return (
    <>
      {canViewDetails && (
        <IconButton
          size="small"
          aria-label="View Details"
          onClick={detailClick}
          title="View Details"
        >
          <LibraryBooks />
        </IconButton>
      )}
      {showDetailDialog && (
        <DetailDialog
          open={showDetailDialog}
          selectedRow={detailData}
          onClose={handleDetailClose}
          arrayColumns={arrayColumns}
        />
      )}
      {editable && (
        <IconButton
          size="small"
          aria-label="Edit"
          onClick={() => setShowEditDialog(prevVal => !prevVal)}
          title="Edit"
        >
          <Edit />
        </IconButton>
      )}
      {showEditDialog && (
        <EditDialog
          open={showEditDialog}
          close={handleRowEditClose}
          editData={data}
          reportIdent={reportIdent}
          tableType={tableType}
        />
      )}
      {data.svg && (
        <IconButton
          size="small"
          aria-label="View Fusion Diagram"
          onClick={() => setShowSvgViewer(prevVal => !prevVal)}
          title="View Fusion Diagram"
        >
          <Photo />
        </IconButton>
      )}
      {showSvgViewer && (
        <SvgViewer
          open={showSvgViewer}
          selectedRow={data}
          onClose={handleSvgViewerClose}
        />
      )}
    </>
  );
}

export default ActionCellRenderer;
