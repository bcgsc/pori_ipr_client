import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
} from '@material-ui/core';
import {
  Edit,
  Photo,
  LibraryBooks,
  OpenInNew,
} from '@material-ui/icons';
import DetailDialog from '../DetailDialog';
import SvgViewer from '../SvgViewer';

import './index.scss';

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
      canEdit,
      canViewDetails,
    },
    columnApi,
    onEdit,
  } = params;

  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showSvgViewer, setShowSvgViewer] = useState(false);
  const [columnMapping, setColumnMapping] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);

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

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
      {(data.kbStatementId && !Array.isArray(data.kbStatementId) && data.kbStatementId.match(/^#?-?\d+:-?\d+$/))
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
      {(data.kbStatementId && Array.isArray(data.kbStatementId) && data.kbStatementId.some(statement => statement.match(/^#?-?\d+:-?\d+$/)))
        ? (
          <>
            <IconButton
              size="small"
              aria-label="Open in GraphKB"
              title="Open in GraphKB"
              onClick={handleMenuOpen}
            >
              <OpenInNew />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              {data.kbStatementId.filter(statement => statement.match(/^#?-?\d+:-?\d+$/)).map(statement => (
                <MenuItem
                  key={statement}
                  onClick={handleMenuClose}
                >
                  <a
                    className="action-cell-kb-statement__link"
                    href={`${CONFIG.ENDPOINTS.GRAPHKB}/view/Statement/${statement.replace('#', '')}`}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {statement}
                  </a>
                </MenuItem>
              ))}
            </Menu>
          </>
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
      {canEdit && (
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
