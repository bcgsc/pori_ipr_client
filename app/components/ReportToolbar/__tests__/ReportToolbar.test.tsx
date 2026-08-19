import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import ReportToolbar from '..';

const baseProps = {
  patientId: 'POG123',
  type: 'genomic',
  state: 'ready',
  isSidebarVisible: false,
  onSidebarToggle: () => {},
};

describe('ReportToolbar', () => {
  test('renders the diagnosis, patient id and state in start case', () => {
    render(<ReportToolbar {...baseProps} diagnosis="lung cancer" />);

    expect(screen.getByText('Lung Cancer')).toBeInTheDocument();
    expect(screen.getByText(/POG123/)).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });

  test('toggles the sidebar open when the button is clicked', () => {
    const onSidebarToggle = jest.fn();
    render(<ReportToolbar {...baseProps} onSidebarToggle={onSidebarToggle} />);

    fireEvent.click(screen.getByTitle('Open Sidebar'));

    expect(onSidebarToggle).toHaveBeenCalledWith(true);
  });

  test('shows the close affordance when the sidebar is visible', () => {
    render(<ReportToolbar {...baseProps} isSidebarVisible />);

    expect(screen.getByTitle('Close Sidebar')).toBeInTheDocument();
  });
});
