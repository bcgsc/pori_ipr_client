import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import ReportOverview from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');

const defaultReportOverviewProps = {
  canEdit: false,
  isNew: false,
  templateId: '123456-uuid',
  text: 'Test Text',
  isPrint: false,
};

describe('ReportOverview', () => {
  test('Renders correctly', async () => {
    render(
      <ReportOverview
        {...defaultReportOverviewProps}
      />,
    );
    expect(await screen.findByText('Test Text')).toBeInTheDocument();
  });

  test('Show a fab button to edit if record is editable', () => {
    const { getByRole } = render(
      <ReportOverview
        {...defaultReportOverviewProps}
        canEdit={true}
      />,
    );
    const buttonEl = getByRole('button');
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
        canEdit={true}
        isPrint={true}
        text={'Sir, this is a wendy\'s'}
      />,
    );
    await waitFor(() => { expect(queryByRole('button')).toBeNull(); });
    expect(getByText('Sir, this is a wendy\'s')).toBeInTheDocument();
  });

  test('Opens a dialog to edit record when fab is clicked', async () => {
    const { getByRole, queryByRole } = render(
      <ReportOverview
        {...defaultReportOverviewProps}
        canEdit={true}
      />,
    );

    await waitFor(() => {
      expect(queryByRole('dialog')).toBeNull();
    });
    const buttonEl = getByRole('button');
    await waitFor(() => {
      fireEvent.click(buttonEl);
    });
    expect(getByRole('dialog')).toBeInTheDocument();
  });

  // These tests are TODO for now since the React-Quill component cannot be targetted for change
  test.todo('Sends an API call when record is edited and confirm is clicked');
  test.todo('Does not send an API call out if cancel is clicked');
  test.todo('Does not send an API call out if record is not dirty');
});
