import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import useResource from '@/hooks/useResource';
import useSecurity from '@/hooks/useSecurity';
import { useReportsAll } from '@/queries/get';
import snackbar from '@/services/SnackbarUtils';
import { makeApiError } from '@/test/apiErrorHelpers';
import MyReportsView from '..';

jest.mock('@/queries/get');
jest.mock('@/hooks/useResource');
jest.mock('@/hooks/useSecurity');
jest.mock('@/services/SnackbarUtils');

const mockReport = {
  ident: 'r1',
  patientId: 'POG1',
  biopsyName: 'bx',
  state: 'ready',
  template: { name: 'genomic' },
  projects: [],
  users: [],
  createdAt: '2024-01-01T00:00:00Z',
  createdBy: { ident: 'me' },
};

const mockDeps = () => {
  (useResource as jest.Mock).mockReturnValue({
    adminAccess: true,
    unreviewedAccess: true,
    nonproductionAccess: true,
    allStates: ['ready'],
    unreviewedStates: [],
    nonproductionStates: [],
  });
  (useSecurity as jest.Mock).mockReturnValue({ userDetails: { ident: 'me', projects: [] } });
};

describe('MyReportsView', () => {
  beforeAll(() => {
    ModuleRegistry.registerModules([ClientSideRowModelModule]);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  test('renders the reports table with the current user\'s reports', async () => {
    mockDeps();
    (useReportsAll as jest.Mock).mockReturnValue({ isLoading: false, data: { reports: [mockReport] } });

    render(<MemoryRouter><MyReportsView /></MemoryRouter>);

    expect(await screen.findByText('Export to TSV')).toBeInTheDocument();
  });

  // On failure react-query reports isLoading false with undefined data; the
  // view used to read reportsData.reports unconditionally and crash
  test('does not crash when the reports request 404s', async () => {
    mockDeps();
    (useReportsAll as jest.Mock).mockReturnValue({ isLoading: false, data: undefined });

    expect(() => render(<MemoryRouter><MyReportsView /></MemoryRouter>)).not.toThrow();
    await waitFor(() => expect(screen.queryByText('Export to TSV')).toBeNull());
  });

  test('surfaces the failure through a snackbar', async () => {
    mockDeps();
    (useReportsAll as jest.Mock).mockImplementation((options) => {
      options?.onError?.(makeApiError());
      return { isLoading: false, data: undefined };
    });

    render(<MemoryRouter><MyReportsView /></MemoryRouter>);

    await waitFor(() => expect(snackbar.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load reports'),
    ));
  });
});
