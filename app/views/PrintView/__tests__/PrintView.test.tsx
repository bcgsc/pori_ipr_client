import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import * as queries from '@/queries/get';
import snackbar from '@/services/SnackbarUtils';
import { makeApiError } from '@/test/apiErrorHelpers';
import PrintView from '..';

jest.mock('@/queries/get');
jest.mock('@/services/SnackbarUtils');
// Sections own their own loading and are covered by their own suites; this
// suite is about the print shell's behaviour when the report itself fails
jest.mock('../../ReportView/components/Summary', () => () => <div data-testid="summary" />);
jest.mock('pagedjs', () => ({
  // Handler is the base class the app/handlers modules extend at import time
  Handler: class {},
  Previewer: jest.fn().mockImplementation(() => ({
    registerHandlers: jest.fn().mockResolvedValue(undefined),
    preview: jest.fn().mockResolvedValue(undefined),
  })),
}));

const report = {
  ident: 'report-1',
  patientId: 'PAT-1',
  patientInformation: { diagnosis: 'Cancer', biopsySite: 'Liver' },
  template: { ident: 'template-1', name: 'genomic' },
};

const template = {
  ident: 'template-1',
  name: 'genomic',
  sections: [],
  headerImage: null,
};

type QueryResult = {
  data?: unknown;
  error?: Error;
  refetch?: jest.Mock;
};

const renderPrint = (reportResult: QueryResult, templatesResult: QueryResult) => {
  (queries.useReport as jest.Mock).mockImplementation((_ident, options) => {
    if (reportResult.error && options?.onError) {
      options.onError(reportResult.error);
    }
    return { refetch: jest.fn(), ...reportResult };
  });
  (queries.useTemplatesAll as jest.Mock).mockImplementation((options) => {
    if (templatesResult.error && options?.onError) {
      options.onError(templatesResult.error);
    }
    return templatesResult;
  });
  return render(
    <MemoryRouter>
      <PrintView />
    </MemoryRouter>,
  );
};

describe('PrintView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  test('renders the report header on the happy path', async () => {
    renderPrint({ data: report }, { data: [template] });

    // PAT-1 also appears in the running header, so pin to the title heading
    expect(await screen.findByRole('heading', { name: 'PAT-1' })).toBeInTheDocument();
    expect(screen.queryByText(/could not be loaded for printing/)).toBeNull();
  });

  test('shows an on-page message instead of a blank page when the report 404s', async () => {
    renderPrint({ data: undefined, error: makeApiError() }, { data: [template] });

    expect(await screen.findByText(/could not be loaded for printing/)).toBeInTheDocument();
  });

  test('never shows a snackbar when the report 404s', async () => {
    renderPrint({ data: undefined, error: makeApiError() }, { data: [template] });

    await screen.findByText(/could not be loaded for printing/);
    expect(snackbar.error).not.toHaveBeenCalled();
  });

  test('logs the failure so it stays diagnosable', async () => {
    renderPrint({ data: undefined, error: makeApiError() }, { data: [template] });

    await waitFor(() => expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Unable to load report'),
      expect.any(Error),
    ));
  });

  test('never shows a snackbar when the templates request 404s', async () => {
    renderPrint({ data: report }, { data: undefined, error: makeApiError() });

    await screen.findByRole('heading', { name: 'PAT-1' });
    expect(snackbar.error).not.toHaveBeenCalled();
  });
});
