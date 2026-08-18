import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import { useTemplatesAll } from '@/queries/get';
import { TemplateView } from '..';

jest.mock('@/queries/get');
jest.mock('@/services/SnackbarUtils');
// The add/edit dialog has its own data dependencies; it stays closed in these tests
jest.mock('../components/AddEditTemplate', () => () => null);

const templates = [
  {
    ident: 't1', name: 'Genomic Template', sections: ['summary'], signatureTypes: [],
  },
  {
    ident: 't2', name: 'Probe Template', sections: ['summary'], signatureTypes: [],
  },
];

const renderView = () => {
  (useTemplatesAll as jest.Mock).mockReturnValue({ data: templates, refetch: jest.fn() });
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <TemplateView />
    </QueryClientProvider>,
  );
};

describe('TemplateView', () => {
  beforeAll(() => {
    ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);
  });

  test('renders the templates table with its title', async () => {
    renderView();

    expect(await screen.findByText('Report Templates')).toBeInTheDocument();
  });

  test('renders a row for each template', async () => {
    renderView();

    expect(await screen.findByText('Genomic Template')).toBeInTheDocument();
    expect(screen.getByText('Probe Template')).toBeInTheDocument();
  });
});
