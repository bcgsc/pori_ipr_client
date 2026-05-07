// eslint-disable-next-line import/no-extraneous-dependencies
import '@ag-grid-community/styles/ag-grid.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import '@ag-grid-community/styles/ag-theme-material.css';
import React from 'react';
import { StoryFn } from '@storybook/react';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import CivicCellRenderer, { CivicCellRendererProps } from '.';

export default {
  title: 'renderers/CivicCellRenderer',
  component: CivicCellRenderer,
};

const Template = (args) => <CivicCellRenderer {...args} />;

export const WithinGrid = ({
  data = [
    {
      externalSource: ['IPRKB', 'GraphKB', 'CIViC'],
      externalStatementId: ['uuid-iprkb', 'uuid-kb', '1100', '1110', '1111'],
    }, {
      externalSource: 'CIViC',
      externalStatementId: '1100',
    },
  ],
}: CivicCellRendererProps): JSX.Element => (
  <div className="ag-theme-material">
    <AgGridReact
      columnDefs={[
        {
          headerName: 'External Source',
          colId: 'externalSource',
          cellRenderer: 'CivicCellRenderer',
        },
      ]}
      components={{
        CivicCellRenderer,
      }}
      suppressAnimationFrame
      suppressColumnVirtualisation
      modules={[ClientSideRowModelModule]}
      rowData={data}
      domLayout="autoHeight"
    />
  </div>
);

export const CivicSingle: StoryFn<CivicCellRendererProps> = Template.bind({});
CivicSingle.args = {
  data: {
    externalSource: 'CIViC',
    externalStatementId: '1100',
  },
};

export const CivicArray: StoryFn<CivicCellRendererProps> = Template.bind({});
CivicArray.args = {
  data: {
    externalSource: 'CIViC',
    externalStatementId: ['1000', '1100', '1110', '1111'],
  },
};

export const VariousSourcesNoCivicArray: StoryFn<CivicCellRendererProps> = Template.bind({});
VariousSourcesNoCivicArray.args = {
  data: {
    externalSource: ['IPRKB', 'totes-not-civic'],
    externalStatementId: ['uuid-id', '1100', '1110', '1111'],
  },
};

export const VariousSourcesWithCivicArray: StoryFn<CivicCellRendererProps> = Template.bind({});
VariousSourcesWithCivicArray.args = {
  data: {
    externalSource: ['IPRKB', 'GraphKB', 'CIViC'],
    externalStatementId: ['uuid-id', '1100', '1110', '1111'],
  },
};

export const NoCivicSingle: StoryFn<CivicCellRendererProps> = Template.bind({});
NoCivicSingle.args = {
  data: {
    externalSource: 'IPRKB',
    externalStatementId: 'uuid-id',
  },
};

export const NoCivicArray: StoryFn<CivicCellRendererProps> = Template.bind({});
NoCivicArray.args = {
  data: {
    externalSource: 'IPRKB',
    externalStatementId: ['uuid-id1', 'uuid-id2', 'uuid-id3'],
  },
};
