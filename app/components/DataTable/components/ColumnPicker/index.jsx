import React, { useState } from 'react';
import {
  MenuList,
  Checkbox,
  Dialog,
} from '@material-ui/core';
import PropTypes from 'prop-types';

import './index.scss';

/**
 * @param {object} props props
 * @param {string} props.className optional class name
 * @param {string} props.label label for dialog
 * @param {array} props.columns list of column definition objects
 * @param {func} props.onClose callback function to execute on close
 * @return {*} JSX
 */
const ColumnPicker = (props) => {
  const {
    className,
    label,
    columns,
    onClose,
  } = props;

  const [visibleCols, setVisibleCols] = useState(
    columns.filter(c => c.visible),
  );

  const handleChange = (event, changedRow) => {
    if (event.target.checked) {
      setVisibleCols(visibleCols.concat(changedRow));
    } else {
      setVisibleCols(visibleCols.filter((col => col.name !== changedRow.name)));
    }
  };

  return (
    <Dialog
      onClose={() => onClose(visibleCols.map(col => col.colId))}
      open
    >
      <MenuList className={`options-menu ${className || ''}`}>
        <div className="options-menu__label">
          {label}
        </div>
        {columns.map(row => (
          <div key={row.name}>
            <div className="options-menu__content">
              <Checkbox
                color="primary"
                checked={visibleCols.some(col => row.name === col.name)}
                onChange={event => handleChange(event, row)}
              />
              {row.name}
            </div>
          </div>
        ))}
      </MenuList>
    </Dialog>
  );
};

ColumnPicker.propTypes = {
  label: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.object,
  ).isRequired,
  className: PropTypes.string,
  onClose: PropTypes.func,
};

ColumnPicker.defaultProps = {
  className: '',
  onClose: () => {},
};


export default ColumnPicker;
