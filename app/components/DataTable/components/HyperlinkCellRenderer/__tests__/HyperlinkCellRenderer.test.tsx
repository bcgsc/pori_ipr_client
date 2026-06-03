import { render, screen } from '@testing-library/react';
import { ICellRendererParams } from '@ag-grid-community/core';

import HyperlinkCellRenderer from '..';

const params = (value: unknown) => ({ value }) as ICellRendererParams;

describe('HyperlinkCellRenderer', () => {
  test('It matches the snapshot', () => {
    const { asFragment } = render(HyperlinkCellRenderer(params('POG1234')));
    expect(asFragment()).toMatchSnapshot();
  });

  test('It renders the value as link text', () => {
    render(HyperlinkCellRenderer(params('POG1234')));
    expect(screen.getByText('POG1234')).toBeInTheDocument();
  });

  test('It links to the patient report path for the value', () => {
    render(HyperlinkCellRenderer(params('POG1234')));
    expect(screen.getByText('POG1234')).toHaveAttribute('href', '/reports/patients/POG1234');
  });
});
