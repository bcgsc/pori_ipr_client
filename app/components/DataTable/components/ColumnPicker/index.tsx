import React, { useEffect, useState, useCallback } from 'react';
import {
  MenuList,
  Checkbox,
  Dialog,
  FormControlLabel,
} from '@mui/material';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Column } from '@ag-grid-community/core';

import './index.scss';

type ColumnPickerProps = {
  className?: string;
  label?: string;
  columns: (Partial<Column> & { name: string })[],
  // If controlled by external, supply the visible columns
  visibleColumnIds?: string[];
  onClose: (colIds: string[]) => void,
  isOpen: boolean;
};

/**
 * @param {object} props props
 * @param {string} props.className optional class name
 * @param {string} props.label label for dialog
 * @param {array} props.columns list of column definition objects
 * @param {func} props.onClose callback function to execute on close
 * @return {*} JSX
 */
const ColumnPicker = ({
  className,
  label,
  columns,
  visibleColumnIds,
  onClose,
  isOpen,
}: ColumnPickerProps): JSX.Element => {
  const [visibleCols, setVisibleCols] = useState<string[]>([]);

  useEffect(() => {
    if (visibleColumnIds) {
      setVisibleCols(visibleColumnIds);
    } else {
      // If no visible column Ids are being supplied, take current state of column visibility via column api
      setVisibleCols(columns
        .filter((col) => col?.isVisible())
        .map((col) => col?.getColId()));
    }
  }, [visibleColumnIds, columns]);

  const handleChange = useCallback((event, changedRowId) => {
    if (event.target.checked) {
      setVisibleCols((cols) => [...cols, changedRowId]);
    } else {
      setVisibleCols((cols) => cols.filter((col) => col !== changedRowId));
    }
  }, []);

  return (
    <Dialog
      onClose={() => onClose(visibleCols)}
      open={isOpen}
    >
      <MenuList className={`options-menu ${className || ''}`}>
        <div className="options-menu__label">
          {label}
        </div>
        {columns.map((row) => (
          <div key={row.name}>
            <div className="options-menu__content">
              <FormControlLabel
                control={(
                  <Checkbox
                    color="primary"
                    checked={visibleCols.includes(row?.getColId())}
                    onChange={(event) => handleChange(event, row?.getColId())}
                  />
                )}
                label={row.name ? row.name : row.getColId()}
              />
            </div>
          </div>
        ))}
      </MenuList>
    </Dialog>
  );
};

export {
  ColumnPicker,
  ColumnPickerProps,
};

export default ColumnPicker;
