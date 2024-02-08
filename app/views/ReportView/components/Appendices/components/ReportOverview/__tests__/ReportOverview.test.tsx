import React from 'react';
import {
  render, screen, waitFor, fireEvent, within,
} from '@testing-library/react';

import { ReportOverview, ReportOverviewProps } from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');

const defaultReportOverviewProps: ReportOverviewProps = {
  isPrint: false,
  canEditReportAppendix: false,
  canEditTemplateAppendix: false,
  isNewTemplate: false,
  templateId: '123456-uuid',
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
      <ReportOverview
        {...defaultReportOverviewProps}
        canEditReportAppendix
      />,
    );
    const buttonEl = getByText('Report Appendix');
    expect(buttonEl).not.toBeDisabled();
    expect(buttonEl).toBeTruthy();
  });

  test('Show a fab button to edit template appendix if is editable', () => {
    const { getByText } = render(
      <ReportOverview
        {...defaultReportOverviewProps}
        canEditTemplateAppendix
      />,
    );
    const buttonEl = getByText('Template Appendix');
    expect(buttonEl).not.toBeDisabled();
    expect(buttonEl).toBeTruthy();
  });

  test('Show both fab button to edit report + template appendix if is editable', () => {
    const { getByText } = render(
      <ReportOverview
        {...defaultReportOverviewProps}
        canEditTemplateAppendix
        canEditReportAppendix
      />,
    );
    let buttonEl = getByText('Template Appendix');
    expect(buttonEl).not.toBeDisabled();
    expect(buttonEl).toBeTruthy();
    buttonEl = getByText('Report Appendix');
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
      <ReportOverview
        {...defaultReportOverviewProps}
        canEditTemplateAppendix
        canEditReportAppendix
        isPrint
        reportSpecificText={'Sir, this is a wendy\'s'}
        templateSpecificText={'Madam, this is a wendy\'s'}
      />,
    );
    await waitFor(() => { expect(queryByRole('button')).toBeNull(); });
    expect(getByText('Sir, this is a wendy\'s')).toBeInTheDocument();
    expect(getByText('Madam, this is a wendy\'s')).toBeInTheDocument();
  });

  test('Opens a dialog to edit template appendix text when fab is clicked', async () => {
    const { getByRole, queryByRole, getByText } = render(
      <ReportOverview
        {...defaultReportOverviewProps}
        canEditTemplateAppendix
        canEditReportAppendix
      />,
    );

    await waitFor(() => {
      expect(queryByRole('dialog')).toBeNull();
    });
    const buttonEl = getByText('Template Appendix');
    await waitFor(() => {
      fireEvent.click(buttonEl);
    });
    const dialogDiv = getByRole('dialog');
    expect(dialogDiv).toBeInTheDocument();
    expect(within(dialogDiv).getByText(
      defaultReportOverviewProps.templateSpecificText,
    )).toBeInTheDocument();
    expect(getByText('Edit Appendix')).toBeInTheDocument();
  });

  test('Opens a dialog to edit report appendix text when fab is clicked', async () => {
    const { getByRole, queryByRole, getByText } = render(
      <ReportOverview
        {...defaultReportOverviewProps}
        canEditTemplateAppendix
        canEditReportAppendix
      />,
    );

    await waitFor(() => {
      expect(queryByRole('dialog')).toBeNull();
    });
    const buttonEl = getByText('Report Appendix');
    await waitFor(() => {
      fireEvent.click(buttonEl);
    });
    const dialogDiv = getByRole('dialog');
    expect(dialogDiv).toBeInTheDocument();
    expect(within(dialogDiv).getByText(
      defaultReportOverviewProps.reportSpecificText,
    )).toBeInTheDocument();
    expect(getByText('Edit Appendix')).toBeInTheDocument();
  });

  // These tests are TODO for now since the React-Quill component cannot be targetted for change
  test.todo('Sends an API call when record is edited and confirm is clicked');
  test.todo('Does not send an API call out if cancel is clicked');
  test.todo('Does not send an API call out if record is not dirty');
});
