import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { columnDefs, targetedColumnDefs } from './ColumnDefs';

const coalesceEntries = (entries) => {
  const bucketKey = (entry, delimiter = '||') => {
    const {
      ident, updatedAt, createdAt, ...row
    } = entry;
    const { gene, context, variant } = row;
    return `${gene}${delimiter}${context}${delimiter}${variant}`;
  };

  const buckets = {};

  entries.forEach((entry) => {
    const key = bucketKey(entry);
    if (!buckets[key]) {
      buckets[key] = {
        ...entry, disease: new Set([entry.disease]), reference: new Set([entry.reference]),
      };
    } else {
      buckets[key].disease.add(entry.disease);
      buckets[key].reference.add(entry.reference);
    }
  });
  return Object.values(buckets);
};

const extractCategories = (entries, category) => {
  const grouped = new Set();
  
  entries.forEach((row) => {
    if (row.alterationType === category) {
      grouped.add(row);
    }
  });

  return [...grouped];
};

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
