import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DataTable from '../../../../components/DataTable';
import columnDefs from './columnDefs';

/**
 * @param {object} props props
 * @param {array} props.outliers list of outlier data
 * @return {*} JSX
 */
function Expression(props) {
  const {
    outliers,
  } = props;

  const [visibleCols, setVisibleCols] = useState(
    columnDefs.filter(c => !c.hide).map(c => c.field),
  );

  const [hiddenCols, setHiddenCols] = useState(
    columnDefs.filter(c => c.hide).map(c => c.field),
  );

  const handleVisibleColsChange = (change) => {
    setVisibleCols(change);
  };

  const handleHiddenColsChange = (change) => {
    setHiddenCols(change);
  };

  return (
    <DataTable
      columnDefs={columnDefs}
      rowData={outliers}
      title="Expression Outliers Unsorted Example"
      visibleCols={visibleCols}
      hiddenCols={hiddenCols}
      setVisibleCols={handleVisibleColsChange}
      setHiddenCols={handleHiddenColsChange}
    />
  );
}

Expression.propTypes = {
  outliers: PropTypes.arrayOf(PropTypes.object),
};

Expression.defaultProps = {
  outliers: [],
};

export default Expression;
