import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { coalesceEntries, extractCategories } from './AlterationReduction';
import { columnDefs, targetedColumnDefs } from './ColumnDefs';

/**
 * @param {*} props props
 * @param {array} alterations all ungrouped alteration data
 * @param {array} novel novel alterations
 * @param {array} unknown unknown alterations
 * @param {array} thisCancer therapies approved for this cancer type
 * @param {array} otherCancer therapies approved for other cancer types
 * @param {array} targetedGenes genes found in the targeted gene report
 * @param {func} kbMatchesComponent react component to mutate
 * @returns {*} JSX
 */
function KBMatchesView(props) {
  const {
    alterations,
    novel,
    unknown,
    thisCancer,
    otherCancer,
    targetedGenes,
    kbMatchesComponent,
  } = props;

  const KbMatchesComponent = kbMatchesComponent;

  const [tableData] = useState({
    thisCancer: {
      title: 'Therapies Approved In This Cancer Type',
      rowData: coalesceEntries(thisCancer),
      columnDefs,
    },
    otherCancer: {
      title: 'Therapies Approved In Other Cancer Type',
      rowData: coalesceEntries(otherCancer),
      columnDefs,
    },
    therapeutic: {
      title: 'Therapeutic Alterations',
      rowData: extractCategories(coalesceEntries(alterations), 'therapeutic'),
      columnDefs,
    },
    diagnostic: {
      title: 'Diagnostic Alterations',
      rowData: extractCategories(coalesceEntries(alterations), 'diagnostic'),
      columnDefs,
    },
    prognostic: {
      title: 'Prognostic Alterations',
      rowData: extractCategories(coalesceEntries(alterations), 'prognostic'),
      columnDefs,
    },
    biological: {
      title: 'Biological Alterations',
      rowData: extractCategories(coalesceEntries(alterations), 'biological'),
      columnDefs,
    },
    targetedGenes: {
      title: 'Detected Alterations From Targeted Gene Report',
      rowData: targetedGenes,
      columnDefs: targetedColumnDefs,
    },
  });

  const hiddenTableData = useRef({
    novel: {
      title: 'Alterations For Review',
      rowData: coalesceEntries(novel),
      columnDefs,
      show: false,
    },
    unknown: {
      title: 'Uncharacterized Alterations',
      rowData: coalesceEntries(unknown),
      columnDefs,
      show: false,
    },
  });
  

  return (
    <KbMatchesComponent
      tableData={tableData}
      hiddenTableData={hiddenTableData}
      syncedColumnDefs={columnDefs}
    />
  );
}

KBMatchesView.propTypes = {
  alterations: PropTypes.arrayOf(PropTypes.object).isRequired,
  novel: PropTypes.arrayOf(PropTypes.object).isRequired,
  unknown: PropTypes.arrayOf(PropTypes.object).isRequired,
  thisCancer: PropTypes.arrayOf(PropTypes.object).isRequired,
  otherCancer: PropTypes.arrayOf(PropTypes.object).isRequired,
  targetedGenes: PropTypes.arrayOf(PropTypes.object).isRequired,
  kbMatchesComponent: PropTypes.func.isRequired,
};

export default KBMatchesView;
