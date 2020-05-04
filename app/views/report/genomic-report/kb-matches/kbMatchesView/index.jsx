import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

const coalesceEntries = (entries) => {
  const bucketKey = (entry, delimiter = '||') => {
    if (entry.variant.gene1) {
      const {
        context,
        variant: { name: variantName, gene1: { name: gene1Name }, gene2: { name: gene2Name } },
      } = entry;
      return `${gene1Name}${delimiter}${gene2Name}${delimiter}${context}${delimiter}${variantName}`;
    }
    const { context, variant: { name: variantName, gene: { name: geneName } } } = entry;
    return `${geneName}${delimiter}${context}${delimiter}${variantName}`;
  };

  const buckets = {};

  entries.forEach((entry) => {
    const key = bucketKey(entry);
    if (!buckets[key]) {
      buckets[key] = {
        ...entry, disease: new Set([entry.disease]), reference: new Set(entry.reference.split(';')),
      };
    } else {
      buckets[key].disease.add(entry.disease);
      buckets[key].reference.add(entry.reference);
    }
  });

  Object.values(buckets).forEach((val) => {
    val.disease = [...val.disease];
    val.reference = [...val.reference];
  });
  return Object.values(buckets);
};

const extractCategories = (entries, category) => {
  const grouped = new Set();

  entries.forEach((row) => {
    if (row.category === category) {
      grouped.add(row);
    }
  });

  return [...grouped];
};

/**
 * @param {*} props props
 * @param {array} props.alterations all ungrouped alteration data
 * @param {array} props.unknown unknown alterations
 * @param {array} props.thisCancer therapies approved for this cancer type
 * @param {array} props.otherCancer therapies approved for other cancer types
 * @param {array} props.targetedGenes genes found in the targeted gene report
 * @param {func} props.kbMatchesComponent react component to mutate
 * @param {object} props.report report object
 * @param {bool} props.isProbe is this a probe report
 * @returns {*} JSX
 */
function KBMatchesView(props) {
  const {
    alterations,
    unknown,
    thisCancer,
    otherCancer,
    targetedGenes,
    kbMatchesComponent,
    report,
    isProbe,
  } = props;

  const KbMatchesComponent = kbMatchesComponent;

  const [syncedTableData] = useState({
    thisCancer: {
      titleText: 'Therapies Approved In This Cancer Type',
      rowData: coalesceEntries(thisCancer),
    },
    otherCancer: {
      titleText: 'Therapies Approved In Other Cancer Type',
      rowData: coalesceEntries(otherCancer),
    },
    therapeutic: {
      titleText: 'Therapeutic Alterations',
      rowData: extractCategories(coalesceEntries(alterations), 'therapeutic'),
    },
    diagnostic: {
      titleText: 'Diagnostic Alterations',
      rowData: extractCategories(coalesceEntries(alterations), 'diagnostic'),
    },
    prognostic: {
      titleText: 'Prognostic Alterations',
      rowData: extractCategories(coalesceEntries(alterations), 'prognostic'),
    },
    biological: {
      titleText: 'Biological Alterations',
      rowData: extractCategories(coalesceEntries(alterations), 'biological'),
    },
  });

  const [unsyncedTableData] = useState({
    titleText: 'Detected Alterations From Targeted Gene Report',
    rowData: targetedGenes,
  });

  const hiddenTableData = useRef({
    unknown: {
      titleText: 'Other Alterations',
      rowData: coalesceEntries(unknown),
      show: false,
    },
  });


  return (
    <KbMatchesComponent
      syncedTableData={syncedTableData}
      unsyncedTableData={unsyncedTableData}
      hiddenTableData={hiddenTableData}
      reportIdent={report.ident}
      isProbe
    />
  );
}

KBMatchesView.propTypes = {
  alterations: PropTypes.arrayOf(PropTypes.object).isRequired,
  unknown: PropTypes.arrayOf(PropTypes.object).isRequired,
  thisCancer: PropTypes.arrayOf(PropTypes.object).isRequired,
  otherCancer: PropTypes.arrayOf(PropTypes.object).isRequired,
  targetedGenes: PropTypes.arrayOf(PropTypes.object),
  kbMatchesComponent: PropTypes.func.isRequired,
  report: PropTypes.objectOf(PropTypes.any).isRequired,
  isProbe: PropTypes.bool,
};

KBMatchesView.defaultProps = {
  targetedGenes: [],
  isProbe: false,
};

export default KBMatchesView;
