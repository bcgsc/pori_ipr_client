import React, { useState, useEffect } from 'react';
import {
  IconButton,
} from '@material-ui/core';
import {
  Edit,
  Photo,
  LibraryBooks,
  OpenInNew,
} from '@material-ui/icons';
import DetailDialog from '../DetailDialog';
import SvgViewer from '../SvgViewer';

/**
 * @param {object} params params
 * @param {string} params.value display text
 * @param {string} props.link target link
 * @param {function} props.onEdit handler which is trigger on the user clicking the edit icon for this row
 * @return {*} JSX
 */
function ActionCellRenderer(params) {
  const {
    data,
    context: {
      editable,
      canViewDetails,
    },
    columnApi,
    onEdit,
  } = params;

  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showSvgViewer, setShowSvgViewer] = useState(false);
  const [columnMapping, setColumnMapping] = useState({});

  useEffect(() => {
    if (showDetailDialog) {
      setColumnMapping(
        columnApi.getAllColumns().reduce((accumulator, current) => {
          accumulator[current.colId] = columnApi.getDisplayNameForColumn(current);
          return accumulator;
        }, {}),
      );
    }
  }, [showDetailDialog]);

  const detailClick = () => {
    setShowDetailDialog(true);
  };

  const handleDetailClose = () => {
    setShowDetailDialog(false);
  };

  const handleSvgViewerClose = () => {
    setShowSvgViewer(false);
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
      {data.kbStatementId && !Array.isArray(data.kbStatementId) && data.kbStatementId.match(/^#?-?\d+:-?\d+$/)
        ? (
          <IconButton
            size="small"
            aria-label="Open in GraphKB"
            title="Open in GraphKB"
            href={`${CONFIG.ENDPOINTS.GRAPHKB}/view/Statement/${data.kbStatementId.replace('#', '')}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <OpenInNew />
          </IconButton>
        ) : null
      }
      {Array.isArray(data.kbStatementId) && data.kbStatementId.some(statement => statement.match(/^#?-?\d+:-?\d+$/))
        ? (
          <div>
            test
          </div>
        ) : null
      }
      {showDetailDialog && (
        <DetailDialog
          open={showDetailDialog}
          selectedRow={data}
          onClose={handleDetailClose}
          columnMapping={columnMapping}
        />
      )}
      {editable && (
        <IconButton
          size="small"
          aria-label="Edit"
          onClick={onEdit}
          title="Edit"
        >
          <Edit />
        </IconButton>
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
