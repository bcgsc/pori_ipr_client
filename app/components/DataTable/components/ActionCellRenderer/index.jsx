import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Edit,
  Photo,
  LibraryBooks,
  OpenInNew,
  Delete,
} from '@mui/icons-material';
import DetailDialog from '../DetailDialog';
import SvgViewer from '../SvgViewer';
import ImageViewer from '../ImageViewer';

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
      canDelete,
    },
    columnApi,
    onEdit,
    onDelete,
  } = params;

  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showSvgViewer, setShowSvgViewer] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
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
  }, [columnApi, showDetailDialog]);

  const detailClick = () => {
    setShowDetailDialog(true);
  };

  const handleDetailClose = () => {
    setShowDetailDialog(false);
  };

  const handleSvgViewerClose = () => {
    setShowSvgViewer(false);
  };

  const handleImageViewerClose = () => {
    setShowImageViewer(false);
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
      {(!window._env_.IS_DEMO && data.kbStatementId && !Array.isArray(data.kbStatementId) && data.kbStatementId.match(/^#?-?\d+:-?\d+$/))
        ? (
          <IconButton
            size="small"
            aria-label="Open in GraphKB"
            title="Open in GraphKB"
            href={`${window._env_.GRAPHKB_URL}/view/Statement/${data.kbStatementId.replace('#', '')}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <OpenInNew />
          </IconButton>
        ) : null
      }
      {(!window._env_.IS_DEMO && data.kbStatementId && Array.isArray(data.kbStatementId) && data.kbStatementId.some(statement => statement.match(/^#?-?\d+:-?\d+$/)))
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
                    href={`${window._env_.GRAPHKB_URL}/view/Statement/${statement.replace('#', '')}`}
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
          isOpen={showDetailDialog}
          selectedRow={data}
          onClose={handleDetailClose}
          columnMapping={columnMapping}
        />
      )}
      {canDelete && (
        <IconButton
          size="small"
          aria-label="Delete"
          onClick={() => onDelete(data.ident)}
          title="Delete"
        >
          <Delete />
        </IconButton>
      )}
      {canEdit && (
        <IconButton
          size="small"
          aria-label="Edit"
          onClick={() => onEdit(data)}
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
          isOpen={showSvgViewer}
          selectedRow={data}
          onClose={handleSvgViewerClose}
        />
      )}
      {data.image && (
        <IconButton
          size="small"
          aria-label="View Image"
          onClick={() => setShowImageViewer(prevVal => !prevVal)}
          title="View Image"
        >
          <Photo />
        </IconButton>
      )}
      {showImageViewer && (
        <ImageViewer
          isOpen={showImageViewer}
          selectedRow={data}
          onClose={handleImageViewerClose}
        />
      )}
    </>
  );
}

export default ActionCellRenderer;
