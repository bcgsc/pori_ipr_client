import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

const coalesceEntries = (entries) => {
  const getVariantName = (variant, variantType) => {
    if (variantType === 'cnv') {
      return `${variant.gene.name} ${variant.cnvState}`;
    }
    if (variantType === 'sv') {
      return `(${
        variant.gene1.name || '?'
      },${
        variant.gene2.name || '?'
      }):fusion(e.${
        variant.exon1 || '?'
      },e.${
        variant.exon2 || '?'
      })`;
    }
    if (variantType === 'mut') {
      return `${variant.gene.name}:${variant.proteinChange}`;
    }
    return `${variant.gene.name} ${variant.expressionState}`;
  };

  const getBucketKey = (entry, delimiter = '||') => {
    if (entry.variant.gene1) {
      const {
        context,
        variantType,
        variant,
        variant: { gene1: { name: gene1Name }, gene2: { name: gene2Name } },
      } = entry;
      const variantName = getVariantName(variant, variantType);
      return `${gene1Name}${delimiter}${gene2Name}${delimiter}${context}${delimiter}${variantName}`;
    }
    const {
      context,
      variant,
      variantType,
      variant: { gene: { name: geneName } },
    } = entry;
    const variantName = getVariantName(variant, variantType);
    return `${geneName}${delimiter}${context}${delimiter}${variantName}`;
  };

  const buckets = {};

  entries.forEach((entry) => {
    const bucketKey = getBucketKey(entry);
    if (!buckets[bucketKey]) {
      buckets[bucketKey] = {
        ...entry, reference: entry.reference.split(';'),
      };
    } else {
      Object.entries(entry).forEach(([key, value]) => {
        if (Array.isArray(buckets[bucketKey][key])) {
          if (!buckets[bucketKey][key].includes(value)) {
            buckets[bucketKey][key].push(value);
          }
        } else if (typeof buckets[bucketKey][key] === 'object') {
          // the only object is variant which matches due to being in the same bucket. No action
          return;
        } else if (buckets[bucketKey][key] !== value) {
          buckets[bucketKey][key] = [buckets[bucketKey][key], value];
        }
      });
    }
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
    unknown: {
      titleText: 'Other Alterations',
      rowData: coalesceEntries(unknown),
    },
  });

  const [unsyncedTableData] = useState({
    titleText: 'Detected Alterations From Targeted Gene Report',
    rowData: targetedGenes,
  });

  return (
    <KbMatchesComponent
      syncedTableData={syncedTableData}
      unsyncedTableData={unsyncedTableData}
      reportIdent={report.ident}
      isProbe={isProbe}
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
