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
  Delete,
} from '@material-ui/icons';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ICellRendererParams } from '@ag-grid-community/core';

import DetailDialog from '../DetailDialog';
import SvgViewer from '../SvgViewer';
import ImageViewer from '../ImageViewer';

import './index.scss';

type ActionCellRendererProps = {
  context?: {
    canEdit?: boolean;
    canViewDetails?: boolean;
    canDelete?: boolean;
  };
  onEdit?: (data) => void;
  onDelete?: (data: string) => void;
} & Partial<ICellRendererParams>;

const ActionCellRenderer = ({
  data,
  context: {
    canEdit,
    canViewDetails,
    canDelete,
  } = {},
  columnApi,
  onEdit,
  onDelete,
}: ActionCellRendererProps): JSX.Element => {
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showSvgViewer, setShowSvgViewer] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [columnMapping, setColumnMapping] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    if (showDetailDialog) {
      setColumnMapping(
        columnApi.getAllColumns().reduce((accumulator, current) => {
          accumulator[current.getColId()] = columnApi.getDisplayNameForColumn(current, null);
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
          aria-label="View Details"
          data-testid="view-details"
          onClick={detailClick}
          size="small"
          title="View Details"
        >
          <LibraryBooks />
        </IconButton>
      )}
      {(!window._env_.IS_DEMO && data.kbStatementId && !Array.isArray(data.kbStatementId) && data.kbStatementId.match(/^#?-?\d+:-?\d+$/))
        ? (
          <IconButton
            aria-label="Open in GraphKB"
            data-testid="graphkb"
            href={`${window._env_.GRAPHKB_URL}/view/Statement/${data.kbStatementId.replace('#', '')}`}
            rel="noreferrer noopener"
            size="small"
            target="_blank"
            title="Open in GraphKB"
          >
            <OpenInNew />
          </IconButton>
        ) : null}
      {(!window._env_.IS_DEMO && data.kbStatementId && Array.isArray(data.kbStatementId) && data.kbStatementId.some((statement) => statement.match(/^#?-?\d+:-?\d+$/)))
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
              {data.kbStatementId.filter((statement) => statement.match(/^#?-?\d+:-?\d+$/)).map((statement) => (
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
        ) : null}
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
          aria-label="Delete"
          data-testid="delete"
          onClick={() => onDelete(data.ident)}
          size="small"
          title="Delete"
        >
          <Delete />
        </IconButton>
      )}
      {canEdit && (
        <IconButton
          aria-label="Edit"
          data-testid="edit"
          onClick={() => onEdit(data)}
          size="small"
          title="Edit"
        >
          <Edit />
        </IconButton>
      )}
      {data.svg && (
        <IconButton
          aria-label="View Fusion Diagram"
          data-testid="fusion"
          onClick={() => setShowSvgViewer((prevVal) => !prevVal)}
          size="small"
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
          aria-label="View Image"
          data-testid="image"
          onClick={() => setShowImageViewer((prevVal) => !prevVal)}
          size="small"
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
};

export default ActionCellRenderer;
