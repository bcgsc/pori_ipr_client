import React from 'react';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { StoryFn } from '@storybook/react';

import DataTable, { DataTableProps } from '@/components/DataTable';
import { ACTIONS_COLUMN } from '@/utils/actionsColumnDef';
import { therapeuticAssociationColDefs, COLLAPSEABLE_COLS } from './columnDefs';
import {
  SORTED_WITH_REPEATS,
} from './RapidVariantOrdering.fixtures';

// App.tsx registers these for the real app; stories mount the grid themselves.
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  CsvExportModule,
]);

export default {
  title: 'views/ReportView/RapidSummary/SummaryTable/WebView',
  component: DataTable,
};

const WEB_ARGS = {
  columnDefs: therapeuticAssociationColDefs.flatMap((cd) => {
    // Adding this for story showing variant type
    if (cd.field === 'genomicEvents') {
      return [
        cd,
        {
          field: 'variantType',
        },
        {
          field: 'cnvState',
        },
      ];
    }
    return cd;
  }),
  collapseColumnFields: [...COLLAPSEABLE_COLS, ACTIONS_COLUMN],
  suppressCollapseSort: true,
  titleText: 'Potential Therapeutic Association',
  isPaginated: true,
};

const Template: StoryFn<DataTableProps> = (args) => <DataTable {...args} />;

export const Default = Template.bind({});
Default.args = { ...WEB_ARGS, rowData: SORTED_WITH_REPEATS };
