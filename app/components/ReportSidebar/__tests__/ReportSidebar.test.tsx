import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ReportContext from '@/context/ReportContext';
import ReportSidebar from '..';

const makeSection = (name: string, uri: string, children = []) => ({
  name, uri, meta: false, showChildren: false, clinician: false, children,
});

const allSections = [
  makeSection('Summary', 'summary'),
  makeSection('Analyst Comments', 'comments'),
  makeSection('Hidden Section', 'hidden'),
];

const renderSidebar = (
  { templateName = 'pog', isSidebarVisible = true } = {},
) => {
  const reportValue = {
    report: { ident: 'report-1', template: { name: templateName } },
  } as unknown as React.ContextType<typeof ReportContext>;

  return render(
    <MemoryRouter initialEntries={['/report/report-1/summary']}>
      <ReportContext.Provider value={reportValue}>
        <ReportSidebar
          allSections={allSections}
          visibleSections={['summary', 'comments']}
          isSidebarVisible={isSidebarVisible}
        />
      </ReportContext.Provider>
    </MemoryRouter>,
  );
};

describe('ReportSidebar', () => {
  test('renders nothing when the sidebar is hidden', () => {
    const { container } = renderSidebar({ isSidebarVisible: false });

    expect(container).toBeEmptyDOMElement();
  });

  test('renders only the visible sections', () => {
    renderSidebar();

    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('Analyst Comments')).toBeInTheDocument();
    expect(screen.queryByText('Hidden Section')).toBeNull();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  test('opens the print layout menu for standard reports', () => {
    renderSidebar({ templateName: 'pog' });

    fireEvent.click(screen.getByTestId('PrintIcon').closest('button'));

    expect(screen.getByText('Condensed Layout')).toBeInTheDocument();
    expect(screen.getByText('Standard Layout')).toBeInTheDocument();
  });

  test('opens the condensed print view directly for genomic reports', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    renderSidebar({ templateName: 'genomic' });

    fireEvent.click(screen.getByTestId('PrintIcon').closest('button'));

    expect(openSpy).toHaveBeenCalledWith('/condensedLayoutPrint/report-1', '_blank', 'noopener,noreferrer');

    openSpy.mockRestore();
  });
});
