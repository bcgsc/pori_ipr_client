import React from 'react';
import {
  act, fireEvent, render, screen, waitFor, within,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import api from '@/services/api';
import { useProjectAll, useTemplatesAll } from '@/queries/get';
import AddEditVariantText from '../components/AddEditVariantText';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');
jest.mock('@/queries/get');
jest.mock('@/components/IPRWYSIWYGEditor', () => ({
  MenuBar: () => <div data-testid="menu-bar" />,
}));
jest.mock('@tiptap/react', () => ({
  EditorContent: () => <div data-testid="editor-content" />,
  useEditor: () => ({
    commands: {
      clearContent: jest.fn(),
      setContent: jest.fn(),
    },
    getHTML: jest.fn(() => '<p>editor content</p>'),
  }),
}));

// jsdom lacks ResizeObserver, which the Text column's HTMLCellRenderer instantiates
class ResizeObserverMock {
  observe = jest.fn();

  unobserve = jest.fn();

  disconnect = jest.fn();
}

const graphkbResults = [
  {
    displayName: 'All Solid Tumor',
    source: { name: 'oncotree' },
  },
  {
    displayName: 'Cutaneous Melanoma',
    source: { name: 'oncotree' },
  },
];

const projectOptions = [
  { ident: 'project-1', name: 'Project One' },
];

const templateOptions = [
  { ident: 'template-1', name: 'Template One' },
];

const editVariantText = {
  ident: 'variant-text-1',
  cancerType: ['Melanoma'],
  projects: projectOptions,
  template: templateOptions[0],
  text: '<p>existing variant text</p>',
  variantName: 'BRAF V600E',
};

const renderView = ({ editData = null, isOpen = true } = {}) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AddEditVariantText editData={editData} isOpen={isOpen} onClose={jest.fn()} />
    </QueryClientProvider>,
  );
};

const mockedUseProjectAll = useProjectAll as jest.Mock;
const mockedUseTemplatesAll = useTemplatesAll as jest.Mock;
const mockedApiGet = api.get as jest.Mock;

describe('AddEditVariantText', () => {
  beforeAll(() => {
    global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
    ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);
  });

  beforeEach(() => {
    jest.useFakeTimers();
    mockedUseProjectAll.mockReturnValue({
      data: projectOptions,
      isLoading: false,
    });
    mockedUseTemplatesAll.mockReturnValue({
      data: templateOptions,
      isLoading: false,
    });
    mockedApiGet.mockReset();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders the create dialog title when no edit data is provided', async () => {
    renderView();

    expect(await screen.findByText('Create Custom Variant Text')).toBeInTheDocument();
  });

  test('renders the edit dialog title when edit data is provided', async () => {
    renderView({ editData: editVariantText });

    expect(await screen.findByText('Edit Variant Text')).toBeInTheDocument();
  });

  test('does not query GraphKB for fewer than 3 characters', async () => {
    renderView();

    const cancerTypeInput = screen.getByLabelText('Cancer Types');

    fireEvent.change(cancerTypeInput, { target: { value: 'me' } });

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockedApiGet).not.toHaveBeenCalled();
    });
  });

  test('queries GraphKB autocomplete options and prioritizes All Solid Tumor results', async () => {
    const graphkbRequest = jest.fn().mockResolvedValue({ result: graphkbResults });
    mockedApiGet.mockReturnValue({ request: graphkbRequest });

    renderView();

    const cancerTypeInput = screen.getByLabelText('Cancer Types');
    fireEvent.change(cancerTypeInput, { target: { value: 'tumor' } });

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockedApiGet).toHaveBeenCalledWith('/graphkb/oncotree?search=tumor');
    });

    const options = await screen.findAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('All Solid Tumor (OncoTree)');
    expect(within(options[0]).getByAltText('OncoTree')).toHaveAttribute('src', 'img/oncotree.png');

    fireEvent.click(options[0]);

    expect(await screen.findByText('All Solid Tumor')).toBeInTheDocument();
    expect(cancerTypeInput).toHaveValue('');
  });
});
