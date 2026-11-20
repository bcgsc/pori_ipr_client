import React from 'react';
import { StoryFn } from '@storybook/react';

import PrintTable, { PrintTableProps } from '@/components/PrintTable';
import { therapeuticAssociationPrintColDefs, COLLAPSEABLE_COLS } from './columnDefs';
import {
  SORTED_WITH_REPEATS,
} from './RapidVariantOrdering.fixtures';

export default {
  title: 'views/ReportView/RapidSummary/SummaryTable/PrintView',
  component: PrintTable,
};

const PRINT_ARGS = {
  columnDefs: therapeuticAssociationPrintColDefs.flatMap((cd) => {
    // Adding this for story showing variant type
    if (cd.field === 'genomicEvents') {
      return [
        cd,
        {
          headerName: 'variantType',
          field: 'variantType',
        },
        {
          headerName: 'cnvState',
          field: 'cnvState',
        },
      ];
    }
    return cd;
  }),
  collapseableCols: COLLAPSEABLE_COLS,
  fullWidth: true,
};

const Template: StoryFn<PrintTableProps> = (args) => <PrintTable {...args} />;

export const Default = Template.bind({});
Default.args = { ...PRINT_ARGS, data: SORTED_WITH_REPEATS };
