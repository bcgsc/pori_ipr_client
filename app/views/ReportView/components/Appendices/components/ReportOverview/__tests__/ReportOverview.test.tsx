import React from 'react';
import {
  render, screen, waitFor, fireEvent, within,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ReportOverview, ReportOverviewProps } from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');

const defaultReportOverviewProps: ReportOverviewProps = {
  isPrint: false,
  canEditReportAppendix: false,
  templateSpecificText: 'template text',
  reportId: '7890-uuid',
  reportSpecificText: 'report text',
};

describe('ReportOverview', () => {
  test('Renders correctly', async () => {
    render(
      <ReportOverview
        {...defaultReportOverviewProps}
      />,
    );
    expect(await screen.findByText(defaultReportOverviewProps.templateSpecificText)).toBeInTheDocument();
    expect(await screen.findByText(defaultReportOverviewProps.reportSpecificText)).toBeInTheDocument();
  });

  test('Show a fab button to edit report appendix if is editable', () => {
    const { getByText } = render(
      <MemoryRouter>
        <ReportOverview
          {...defaultReportOverviewProps}
          canEditReportAppendix
        />
      </MemoryRouter>,
    );
    const buttonEl = getByText("Add text to this report's appendix");
    expect(buttonEl).not.toBeDisabled();
    expect(buttonEl).toBeTruthy();
  });

  test('Does not show a fab button if record is not editable', async () => {
    const { queryByRole } = render(
      <ReportOverview
        {...defaultReportOverviewProps}
      />,
    );
    await waitFor(() => {
      expect(queryByRole('button')).toBeNull();
    });
  });

  test('Does not show a fab button if record is in print mode', async () => {
    const { queryByRole, getByText } = render(
      <MemoryRouter>
        <ReportOverview
          {...defaultReportOverviewProps}
          canEditReportAppendix
          isPrint
          reportSpecificText={'Sir, this is a wendy\'s'}
          templateSpecificText={'Madam, this is a wendy\'s'}
        />
      </MemoryRouter>,
    );
    await waitFor(() => { expect(queryByRole('button')).toBeNull(); });
    expect(getByText('Sir, this is a wendy\'s')).toBeInTheDocument();
    expect(getByText('Madam, this is a wendy\'s')).toBeInTheDocument();
  });

  test('Opens a dialog to edit report appendix text when fab is clicked', async () => {
    const { getByRole, queryByRole, getByText } = render(
      <MemoryRouter>
        <ReportOverview
          {...defaultReportOverviewProps}
          canEditReportAppendix
        />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(queryByRole('dialog')).toBeNull();
    });
    const buttonEl = getByText("Add text to this report's appendix");
    await waitFor(() => {
      fireEvent.click(buttonEl);
    });
    const dialogDiv = getByRole('dialog');
    expect(dialogDiv).toBeInTheDocument();
    expect(within(dialogDiv).getByText(
      defaultReportOverviewProps.reportSpecificText,
    )).toBeInTheDocument();
    expect(getByText('Edit Report Appendix')).toBeInTheDocument();
  });

  // These tests are TODO for now since the React-Quill component cannot be targetted for change
  test.todo('Sends an API call when record is edited and confirm is clicked');
  test.todo('Does not send an API call out if cancel is clicked');
  test.todo('Does not send an API call out if record is not dirty');
});
