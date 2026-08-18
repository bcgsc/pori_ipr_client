import React from 'react';
import { render, screen } from '@testing-library/react';
import { ColDef } from '@ag-grid-community/core';

import PrintTable from '..';

// pagedjs only matters during real paged rendering; stub it out for jsdom
jest.mock('pagedjs', () => ({
  registerHandlers: jest.fn(),
  Handler: class {},
}));

const columnDefs: ColDef[] = [
  { headerName: 'Gene', field: 'gene' },
  { headerName: 'Variant', field: 'variant' },
  { headerName: 'HiddenCol', field: 'hiddenCol', hide: true },
  { headerName: 'Actions', field: 'Actions' },
];

const data = [
  {
    gene: 'TP53', variant: 'p.R175H', hiddenCol: 'x', Actions: 'a',
  },
  {
    gene: 'EGFR', variant: 'L858R', hiddenCol: 'y', Actions: 'b',
  },
];

describe('PrintTable', () => {
  test('renders only visible, non-action column headers', () => {
    render(<PrintTable columnDefs={columnDefs} data={data} />);

    expect(screen.getByText('Gene')).toBeInTheDocument();
    expect(screen.getByText('Variant')).toBeInTheDocument();
    expect(screen.queryByText('HiddenCol')).toBeNull();
    expect(screen.queryByText('Actions')).toBeNull();
  });

  test('renders a row for each data entry', () => {
    render(<PrintTable columnDefs={columnDefs} data={data} />);

    expect(screen.getByText('TP53')).toBeInTheDocument();
    expect(screen.getByText('EGFR')).toBeInTheDocument();
  });

  test('shows the no-rows text when there is no data', () => {
    render(<PrintTable columnDefs={columnDefs} data={[]} noRowsText="Nothing to show" />);

    expect(screen.getByText('Nothing to show')).toBeInTheDocument();
  });

  test('evaluates function valueGetters', () => {
    const colDefs: ColDef[] = [
      { headerName: 'Combined', field: 'combined', valueGetter: ({ data: d }) => `${d.a}-${d.b}` },
    ];
    render(<PrintTable columnDefs={colDefs} data={[{ a: '1', b: '2' }]} />);

    expect(screen.getByText('1-2')).toBeInTheDocument();
  });

  test('orders columns by the explicit order prop', () => {
    render(<PrintTable columnDefs={columnDefs} data={data} order={['Variant', 'Gene']} />);

    const headers = screen.getAllByRole('columnheader').map((h) => h.textContent);
    expect(headers).toEqual(['Variant', 'Gene']);
  });
});
