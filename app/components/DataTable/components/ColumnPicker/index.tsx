import React, { useEffect, useState } from 'react';
import {
  MenuList,
  Checkbox,
  Dialog,
} from '@material-ui/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Column } from '@ag-grid-community/core';

import './index.scss';

type ColumnPickerProps = {
  className?: string;
  label?: string;
  columns: Column[],
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
  onClose,
  isOpen,
}: ColumnPickerProps): JSX.Element => {
  const [visibleCols, setVisibleCols] = useState([]);
  
  useEffect(() => {
    if (columns) {
      setVisibleCols(columns.filter((col) => col.isVisible()));
    }
  }, [columns]);

  const handleChange = (event, changedRow) => {
    if (event.target.checked) {
      setVisibleCols(visibleCols.concat(changedRow));
    } else {
      setVisibleCols(visibleCols.filter((col) => col.name !== changedRow.name));
    }
  };

  return (
    <Dialog
      onClose={() => onClose(visibleCols.map((col) => col.colId))}
      open={isOpen}
    >
      <MenuList className={`options-menu ${className || ''}`}>
        <div className="options-menu__label">
          {label}
        </div>
        {columns.map((row) => (
          <div key={row.name}>
            <div className="options-menu__content">
              <Checkbox
                color="primary"
                checked={visibleCols.some((col) => row.name === col.name)}
                onChange={(event) => handleChange(event, row)}
              />
              {row.name}
            </div>
          </div>
        ))}
      </MenuList>
    </Dialog>
  );
};

export default ColumnPicker;
