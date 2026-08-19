import React from 'react';
import { render, screen } from '@testing-library/react';

import { ReportType } from '@/common';
import TumourSummary from '..';

// The edit dialog has its own query/context deps; it only mounts on click, but mock it defensively
jest.mock('@/components/TumourSummaryEdit', () => ({ TumourSummaryEdit: () => null }));

const report = { ident: 'report-1' } as unknown as ReportType;

const tumourSummary = [
  { term: 'Tumour Content', value: '70%' },
  { term: 'MSI Status', value: 'MSS' },
] as never;

const baseProps = {
  report,
  tumourSummary,
  canEdit: false,
  isPrint: false,
  loadedDispatch: jest.fn(),
  microbial: [],
  hla: [],
  tCellCd8: undefined,
  mutationBurden: undefined,
  tmburMutBur: undefined,
  msi: undefined,
} as never;

describe('TumourSummary', () => {
  test('renders the summary entries', () => {
    render(<TumourSummary {...baseProps} />);

    expect(screen.getByText('Tumour Summary')).toBeInTheDocument();
    expect(screen.getByText('Tumour Content:')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  test('shows the edit button when editable and not printing', () => {
    render(<TumourSummary {...baseProps} canEdit />);

    expect(screen.getByTestId('EditIcon')).toBeInTheDocument();
  });

  test('hides the edit button when not editable', () => {
    render(<TumourSummary {...baseProps} canEdit={false} />);

    expect(screen.queryByTestId('EditIcon')).toBeNull();
  });

  test('renders the condensed print layout without an edit button', () => {
    render(<TumourSummary {...baseProps} canEdit isPrint printVersion="condensedLayout" />);

    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.queryByTestId('EditIcon')).toBeNull();
  });
});
