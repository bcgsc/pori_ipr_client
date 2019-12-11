import {
  MenuList, Checkbox,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import './index.scss';

/**
 * @param {object} props props
 * @property {array} props.options options array
 * @property {string} props.className optional class name
 * @return {*} JSX
 */
function OptionsMenu(props) {
  const {
    className,
    label,
    columns,
    onClose,
  } = props;

  const [visibleCols, setVisibleCols] = useState(
    Object.values(columns).filter(c => !c.hide).map(c => c.colId),
  );

  const [hiddenCols, setHiddenCols] = useState(
    Object.values(columns).filter(c => c.hide).map(c => c.colId),
  );

  const handleChange = (event, colId) => {
    if (visibleCols.includes(colId)) {
      const index = visibleCols.indexOf(colId);
      const visibleColsCopy = [...visibleCols];
      visibleColsCopy.splice(index, 1);
      setVisibleCols(visibleColsCopy);

      const hiddenColsCopy = [...hiddenCols];
      hiddenColsCopy.push(colId);
      setHiddenCols(hiddenColsCopy);
    } else {
      const index = hiddenCols.indexOf(colId);
      const hiddenColsCopy = [...hiddenCols];
      hiddenColsCopy.splice(index, 1);
      setHiddenCols(hiddenColsCopy);

      const visibleColsCopy = [...visibleCols];
      visibleColsCopy.push(colId);
      setVisibleCols(visibleColsCopy);
    }
    // row.hide = !row.hide;
    // const index = columnDef.findIndex(c => c === row);
    // const colDefCopy = [...columnDef];
    // colDefCopy[index] = row;
    // setColumnDef(colDefCopy);
  };

  const updateOnClose = () => ({ hiddenCols, visibleCols });

  useEffect(() => {
    onClose(updateOnClose);
  }, [hiddenCols, visibleCols]);

  return (
    <MenuList className={`options-menu ${className || ''}`}>
      <div className="options-menu__label">
        {label}
      </div>
      {columns.map(row => (
        <div key={row.headerName}>
          <div className="options-menu__content">
            <Checkbox
              checked={visibleCols.includes(row.colId)}
              onChange={event => handleChange(event, row.colId)}
            />
            {row.headerName}
          </div>
        </div>
      ))
      }
    </MenuList>
  );
}

OptionsMenu.propTypes = {
  label: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.object,
  ).isRequired,
  className: PropTypes.string,
  onClose: PropTypes.function,
};

OptionsMenu.defaultProps = {
  className: '',
};


export default OptionsMenu;
