import React from 'react';
import PropTypes from 'prop-types';
import DataTable from './data-table';

/**
 * 
 * @param {*} props 
 */
function KBMatches(props) {
  const {
    alterations,
    novelAlterations,
    unknownAlterations,
    approvedThisCancer,
    approvedOtherCancer,
    targetedGenes,
  } = props;

  return (
    <div>
      test
    </div>
  );
}

KBMatches.propTypes = {

};

export default KBMatches;
