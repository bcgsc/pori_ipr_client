import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DataTable from '../../../../components/DataTable';
import columnDefs from './columnDefs';

/**
 * @param {object} props props
 * @param {array} props.outliers list of outlier data
 * @param {string} props.titleText title of table
 * @param {string} props.reportId current report ID
 * @return {*} JSX
 */
function Expression(props) {
  const {
    outliers,
    titleText,
    reportId,
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
      titleText={titleText}
      visibleCols={visibleCols}
      hiddenCols={hiddenCols}
      setVisibleCols={handleVisibleColsChange}
      setHiddenCols={handleHiddenColsChange}
      reportId={reportId}
    />
  );
}

Expression.propTypes = {
  outliers: PropTypes.arrayOf(PropTypes.object),
  titleText: PropTypes.string.isRequired,
  reportId: PropTypes.string.isRequired,
};

Expression.defaultProps = {
  outliers: [],
};

export default Expression;
