import React, {
  useState, useEffect, useMemo, useCallback,
} from 'react';
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
  displayMode?: 'tableCell' | 'menu';
} & Partial<ICellRendererParams>;

const WrapperComponent = ({
  displayMode,
  children,
  onClick = () => {},
  ...rest
}: {
  displayMode: ActionCellRendererProps['displayMode'];
  children: React.ReactNode;
  onClick?: React.MouseEventHandler;
}) => {
  if (displayMode === 'menu') {
    return (
      <MenuItem onClick={onClick} {...rest}>
        {children}
      </MenuItem>
    );
  }

  // We don't deal with multiple nodes for now
  if (Array.isArray(children)) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <span {...rest}>{children}</span>;
  }

  if (React.isValidElement(children)) {
    return React.cloneElement(children, { onClick, ...rest });
  }
  return null;
};

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
  displayMode = 'tableCell',
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

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleDelete = useCallback(() => {
    onDelete(data.ident);
  }, [data.ident, onDelete]);

  const handleEdit = useCallback(() => {
    onEdit(data);
  }, [data, onEdit]);

  const hasImageData = Array.isArray(data.image) ? data.image.length > 0 : data.image;

  const openGraphKbButton = useMemo(() => {
    if (!window._env_.IS_DEMO && data.kbStatementId) {
      if (!Array.isArray(data.kbStatementId) && data.kbStatementId.match(/^#?-?\d+:-?\d+$/)) {
        return (
          <WrapperComponent
            data-testid="graphkb"
            onClick={() => window.open(`${window._env_.GRAPHKB_URL}/view/Statement/${data.kbStatementId.replace('#', '')}`, '_blank')}
            displayMode={displayMode}
          >
            {
              displayMode === 'tableCell' ? (
                <IconButton
                  aria-label="Open in GraphKB"
                  size="small"
                  title="Open in GraphKB"
                >
                  <OpenInNew />
                </IconButton>
              ) : 'Open in GraphKB'
            }
          </WrapperComponent>
        );
      }
      if (Array.isArray(data.kbStatementId) && data.kbStatementId.some((statement) => statement.match(/^#?-?\d+:-?\d+$/))) {
        return (
          <>
            <WrapperComponent onClick={handleMenuOpen} displayMode={displayMode}>
              {displayMode === 'tableCell' ? (
                <IconButton
                  size="small"
                  aria-label="Open in GraphKB"
                  title="Open in GraphKB"
                >
                  <OpenInNew />
                </IconButton>
              ) : 'Open in GraphKB'}
            </WrapperComponent>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              {data.kbStatementId.filter((statement) => statement.match(/^#?-?\d+:-?\d+$/)).map((statement) => (
                <MenuItem
                  key={statement}
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
        );
      }
    }
    return null;
  }, [anchorEl, data.kbStatementId, displayMode, handleMenuClose]);

  return (
    <>
      {canViewDetails && (
        <WrapperComponent data-testid="view-details" onClick={detailClick} displayMode={displayMode}>
          {displayMode === 'tableCell' ? (
            <IconButton
              aria-label="View Details"
              size="small"
              title="View Details"
            >
              <LibraryBooks />
            </IconButton>
          ) : 'View Details'}
        </WrapperComponent>
      )}
      {showDetailDialog && (
        <DetailDialog
          isOpen={showDetailDialog}
          selectedRow={data}
          onClose={handleDetailClose}
          columnMapping={columnMapping}
        />
      )}
      {openGraphKbButton}
      {canDelete && (
        <WrapperComponent data-testid="delete" onClick={handleDelete} displayMode={displayMode}>
          {displayMode === 'tableCell' ? (
            <IconButton
              aria-label="Delete"
              size="small"
              title="Delete"
            >
              <Delete />
            </IconButton>
          ) : 'Delete Row'}
        </WrapperComponent>
      )}
      {canEdit && (
        <WrapperComponent data-testid="edit" onClick={handleEdit} displayMode={displayMode}>
          {displayMode === 'tableCell' ? (
            <IconButton
              aria-label="Edit"
              size="small"
              title="Edit"
            >
              <Edit />
            </IconButton>
          ) : 'Edit Row'}
        </WrapperComponent>
      )}
      {data.svg && (
        <WrapperComponent data-testid="fusion" onClick={() => setShowSvgViewer((prevVal) => !prevVal)} displayMode={displayMode}>
          {displayMode === 'tableCell' ? (
            <IconButton
              aria-label="View Fusion Diagram"
              size="small"
              title="View Fusion Diagram"
            >
              <Photo />
            </IconButton>
          ) : 'View Fusion Diagram'}
        </WrapperComponent>
      )}
      {showSvgViewer && (
        <SvgViewer
          isOpen={showSvgViewer}
          selectedRow={data}
          onClose={handleSvgViewerClose}
        />
      )}
      {hasImageData && (
        <WrapperComponent data-testid="image" onClick={() => setShowImageViewer((prevVal) => !prevVal)} displayMode={displayMode}>
          {displayMode === 'tableCell' ? (
            <IconButton
              aria-label="View Image"
              size="small"
              title="View Image"
            >
              <Photo />
            </IconButton>
          ) : 'View Image'}
        </WrapperComponent>
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

export {
  ActionCellRendererProps,
  ActionCellRenderer,
};
export default ActionCellRenderer;
