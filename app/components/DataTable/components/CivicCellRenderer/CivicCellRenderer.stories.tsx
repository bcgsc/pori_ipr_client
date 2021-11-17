// eslint-disable-next-line import/no-extraneous-dependencies
import '@ag-grid-community/core/dist/styles/ag-grid.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import '@ag-grid-community/core/dist/styles/ag-theme-material.min.css';
import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import { AgGridReact } from '@ag-grid-community/react/lib/agGridReact';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import CivicCellRenderer, { CivicCellRendererProps } from '.';

export default {
  title: 'renderers/CivicCellRenderer',
  component: CivicCellRenderer,
};

const Template = (args) => <CivicCellRenderer {...args} />;

export const WithinGrid = ({
  data = [{
    externalSource: ['IPRKB', 'GraphKB', 'CIViC'],
    externalStatementId: ['uuid-iprkb', 'uuid-kb', '1100', '1110', '1111'],
  }],
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
      frameworkComponents={{
        CivicCellRenderer,
      }}
      suppressAnimationFrame
      suppressColumnVirtualisation
      disableStaticMarkup
      modules={[ClientSideRowModelModule]}
      rowData={data}
      domLayout="autoHeight"
    />
  </div>
);

export const CivicSingle: Story<CivicCellRendererProps> = Template.bind({});
CivicSingle.args = {
  data: {
    externalSource: 'CIViC',
    externalStatementId: '1100',
  },
};

export const CivicArray: Story<CivicCellRendererProps> = Template.bind({});
CivicArray.args = {
  data: {
    externalSource: 'CIViC',
    externalStatementId: ['1000', '1100', '1110', '1111'],
  },
};

export const VariousSourcesNoCivicArray: Story<CivicCellRendererProps> = Template.bind({});
VariousSourcesNoCivicArray.args = {
  data: {
    externalSource: ['IPRKB', 'totes-not-civic'],
    externalStatementId: ['uuid-id', '1100', '1110', '1111'],
  },
};

export const VariousSourcesWithCivicArray: Story<CivicCellRendererProps> = Template.bind({});
VariousSourcesWithCivicArray.args = {
  data: {
    externalSource: ['IPRKB', 'GraphKB', 'CIViC'],
    externalStatementId: ['uuid-id', '1100', '1110', '1111'],
  },
};

export const NoCivicSingle: Story<CivicCellRendererProps> = Template.bind({});
NoCivicSingle.args = {
  data: {
    externalSource: 'IPRKB',
    externalStatementId: 'uuid-id',
  },
};

export const NoCivicArray: Story<CivicCellRendererProps> = Template.bind({});
NoCivicArray.args = {
  data: {
    externalSource: 'IPRKB',
    externalStatementId: ['uuid-id1', 'uuid-id2', 'uuid-id3'],
  },
};
