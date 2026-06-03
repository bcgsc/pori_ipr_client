import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ReportContext from '@/context/ReportContext';
import { KbMatchesMoveDialogContext } from '@/context/KbMatchesMoveDialogContext/KbmatchesMoveDialogContext';
import KbMatchesActionCellRenderer from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');
// ActionCellRenderer (rendered as the delegate / menu footer) pulls in heavy viewers
// eslint-disable-next-line react/display-name
jest.mock('../../SvgViewer', () => () => <div role="presentation" />);
// eslint-disable-next-line react/display-name
jest.mock('../../ImageViewer', () => () => <div role="presentation" />);

const buildKbContext = (overrides = {}) => ({
  moveKbMatchesDialogOpen: false,
  setMoveKbMatchesDialogOpen: jest.fn(),
  moveKbMatchesTableName: '',
  setMoveKbMatchesTableName: jest.fn(),
  selectedRows: null,
  setSelectedRows: jest.fn(),
  selectedKbIdToIprMapping: {},
  destinationType: 'kbMatches' as const,
  setDestinationType: jest.fn(),
  ...overrides,
});

const renderKb = (
  reportType: string,
  { data = {}, kbContext = buildKbContext() }: { data?: Record<string, unknown>; kbContext?: ReturnType<typeof buildKbContext> } = {},
) => {
  const reportValue = {
    report: { template: { name: reportType } },
    setReport: () => {},
  } as unknown as React.ContextType<typeof ReportContext>;

  render(
    <MemoryRouter>
      <ReportContext.Provider value={reportValue}>
        <KbMatchesMoveDialogContext.Provider value={kbContext}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <KbMatchesActionCellRenderer {...({ data } as any)} />
        </KbMatchesMoveDialogContext.Provider>
      </ReportContext.Provider>
    </MemoryRouter>,
  );
  return { kbContext };
};

describe('KbMatchesActionCellRenderer', () => {
  test('It delegates to the default action renderer for unsupported report types', () => {
    renderKb('pharmacogenomic');
    // The extra KbMatches menu is not rendered for unsupported report types
    expect(screen.queryByText('Move to another KbMatches Table')).toBeNull();
  });

  test('It renders the extra-menu trigger for a supported report type', () => {
    renderKb('genomic');
    // Menu is closed until the trigger is clicked
    expect(screen.queryByText('Move to another KbMatches Table')).toBeNull();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('Genomic reports expose the therapeutic-target menu items', () => {
    renderKb('genomic');
    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Add to Potential Therapeutic Targets')).toBeInTheDocument();
    expect(screen.getByText('Add to Potential Resistance and Toxicity')).toBeInTheDocument();
    expect(screen.getByText('Move to another KbMatches Table')).toBeInTheDocument();
  });

  test('Probe reports show only the move menu item, not the therapeutic ones', () => {
    renderKb('probe');
    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Move to another KbMatches Table')).toBeInTheDocument();
    expect(screen.queryByText('Add to Potential Therapeutic Targets')).toBeNull();
    expect(screen.queryByText('Add Variant to Rapid Summary Table')).toBeNull();
  });

  test('Rapid reports expose the rapid-summary menu item', () => {
    renderKb('rapid');
    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Add Variant to Rapid Summary Table')).toBeInTheDocument();
  });

  test('Choosing "Move to another KbMatches Table" opens the move dialog with the row selected', () => {
    const kbContext = buildKbContext();
    renderKb('genomic', { data: { category: 'therapeutic' }, kbContext });

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('Move to another KbMatches Table'));

    expect(kbContext.setMoveKbMatchesDialogOpen).toHaveBeenCalledWith(true);
    expect(kbContext.setSelectedRows).toHaveBeenCalledWith([{ category: 'therapeutic' }]);
  });
});
