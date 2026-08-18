import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import api from '@/services/api';
import VariantTextView from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');
// The add/edit dialog has its own deps; it stays closed here
jest.mock('../components/AddEditVariantText', () => () => null);

// jsdom lacks ResizeObserver, which the Text column's HTMLCellRenderer instantiates
class ResizeObserverMock {
  observe = jest.fn();

  unobserve = jest.fn();

  disconnect = jest.fn();
}

const variantText = [
  {
    ident: 'v1',
    variantName: 'BRAF V600E',
    text: '<p>variant description</p>',
    cancerType: ['melanoma'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

const renderView = () => {
  (api.get as jest.Mock).mockReturnValue({ request: jest.fn().mockResolvedValue(variantText) });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <VariantTextView />
    </QueryClientProvider>,
  );
};

describe('VariantTextView', () => {
  beforeAll(() => {
    global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
    ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);
  });

  test('renders the variant text table with its title', async () => {
    renderView();

    expect(await screen.findByText('Variant Text')).toBeInTheDocument();
  });

  test('renders the fetched variant rows', async () => {
    renderView();

    expect(await screen.findByText('BRAF V600E')).toBeInTheDocument();
  });
});
