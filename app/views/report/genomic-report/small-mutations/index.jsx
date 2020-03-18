import React from 'react';
import PropTypes from 'prop-types';
import DataTable from '../../../../components/DataTable';
import columnDefs from './columnDefs';

/**
 * @param {object} props props
 * @param {array} props.smallMutations list of small mutation data
 * @return {*} JSX
 */
function SmallMutations(props) {
  const {
    smallMutations,
  } = props;

  return (
    <DataTable
      columnDefs={columnDefs}
      rowData={smallMutations}
      title="Small Mutations Uncategorized Example"
    />
  );
}

SmallMutations.propTypes = {
  smallMutations: PropTypes.arrayOf(PropTypes.object),
};

SmallMutations.defaultProps = {
  smallMutations: [],
};

export default SmallMutations;
