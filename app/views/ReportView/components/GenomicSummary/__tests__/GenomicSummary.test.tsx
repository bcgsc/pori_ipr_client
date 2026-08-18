import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import useReport from '@/hooks/useReport';
import * as queries from '@/queries/get';
import GenomicSummary from '..';

jest.mock('@/hooks/useReport');
jest.mock('@/queries/get');
jest.mock('@/services/SnackbarUtils');
// Both children are tested in isolation; mock them so this is a true shell smoke
jest.mock('../../PatientInformation', () => () => <div data-testid="patient-information" />);
jest.mock('../../TumourSummary', () => () => <div data-testid="tumour-summary" />);

const emptyQuery = { data: [], isLoading: false };

const mockQueryHooks = () => {
  (queries.useReportSummaryMicrobial as jest.Mock).mockReturnValue(emptyQuery);
  (queries.useReportComparators as jest.Mock).mockReturnValue(emptyQuery);
  (queries.useReportMutationSignatures as jest.Mock).mockReturnValue(emptyQuery);
  (queries.useReportImmuneCellTypes as jest.Mock).mockReturnValue(emptyQuery);
  (queries.useReportMutationBurden as jest.Mock).mockReturnValue(emptyQuery);
  (queries.useReportMsi as jest.Mock).mockReturnValue(emptyQuery);
  (queries.useReportTmburMutationBurden as jest.Mock).mockReturnValue({ data: undefined, isLoading: false });
  (queries.useReportHlaTypes as jest.Mock).mockReturnValue(emptyQuery);
};

const renderSection = () => {
  mockQueryHooks();
  (useReport as jest.Mock).mockReturnValue({ report: { ident: 'report-1', state: 'ready' }, canEdit: true });
  return render(
    <MemoryRouter>
      <GenomicSummary isPrint={false} />
    </MemoryRouter>,
  );
};

describe('GenomicSummary', () => {
  test('renders the summary shell once data has loaded', async () => {
    renderSection();

    expect(await screen.findByTestId('patient-information')).toBeInTheDocument();
    expect(screen.getByTestId('tumour-summary')).toBeInTheDocument();
  });
});
