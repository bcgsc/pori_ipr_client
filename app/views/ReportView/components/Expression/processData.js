import { EXPLEVEL } from '@/constants';

const processExpression = (input) => {
  const expressions = {
    clinical: [],
    nostic: [],
    biological: [],
    upreg_onco: [], //  Check for expressionState (str) and gene.oncogene (bool)
    downreg_tsg: [], //  Check for expressionState (str) and gene.tumourSuppressor (bool)
  };

  // Run over mutations and group
  for (const row of input) {
    const { gene: { tumourSuppressor, oncogene } } = row;
    let { expressionState } = row;
    expressionState = expressionState.toLowerCase();

    if (tumourSuppressor && EXPLEVEL.OUT_LOW.includes(expressionState)) {
      expressions.downreg_tsg.push(row);
    }

    if (oncogene && EXPLEVEL.OUT_HIGH.includes(expressionState)) {
      expressions.upreg_onco.push(row);
    }

    // KB matches
    // Therapeutic? => clinical
    if (row.kbMatches.some((m) => m.category === 'therapeutic')) {
      expressions.clinical.push(row);
    }

    // Diagnostic || Prognostic? => nostic
    if (row.kbMatches.some((m) => m.category === 'diagnostic' || m.category === 'prognostic')) {
      expressions.nostic.push(row);
    }

    // Biological ? => Biological
    if (row.kbMatches.some((m) => m.category === 'biological')) {
      expressions.biological.push(row);
    }
  }

  return expressions;
};

export default processExpression;
