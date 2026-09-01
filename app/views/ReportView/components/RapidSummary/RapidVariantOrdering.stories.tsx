import React from 'react';
import { StoryFn } from '@storybook/react';

import PrintTable, { PrintTableProps } from '@/components/PrintTable';
import {
  sortRapidVariants,
  therapeuticAssociationColDefs,
  therapeuticAssociationPrintColDefs,
  COLLAPSEABLE_COLS,
} from './columnDefs';
import { MOCK_RAPID_VARIANTS } from './RapidVariantOrdering.fixtures';

/**
 * Demonstrates the DEVSU-2995 reporting order for the rapid summary (TGR)
 * variant tables. The same mock rows are shown as-received (unsorted) and after
 * sortRapidVariants, so the grouping is visible at a glance:
 *   SNV -> CNV amp -> CNV homdel -> other CNV -> fusion -> signatures.
 * Amp/homdel groups order by copy change high -> low; every other group is
 * alphabetical. Rendered through the real print table + column defs.
 */
export default {
  title: 'views/ReportView/RapidSummary/Variant Ordering',
  component: PrintTable,
};

const Template: StoryFn<PrintTableProps> = (args) => <PrintTable {...args} />;

export const UnsortedInput = Template.bind({});
UnsortedInput.args = {
  data: MOCK_RAPID_VARIANTS,
  columnDefs: therapeuticAssociationPrintColDefs,
  collapseableCols: COLLAPSEABLE_COLS,
  fullWidth: true,
};

export const SortedByAlterationType = Template.bind({});
SortedByAlterationType.args = {
  data: sortRapidVariants(MOCK_RAPID_VARIANTS, therapeuticAssociationColDefs),
  columnDefs: therapeuticAssociationPrintColDefs,
  collapseableCols: COLLAPSEABLE_COLS,
  fullWidth: true,
};
