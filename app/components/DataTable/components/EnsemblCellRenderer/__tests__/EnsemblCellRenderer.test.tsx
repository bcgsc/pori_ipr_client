import React from 'react';
import { render, screen } from '@testing-library/react';
import { ICellRendererParams } from '@ag-grid-community/core';

import EnsemblCellRenderer from '..';

const params = (value: unknown) => ({ value }) as ICellRendererParams;

describe('EnsemblCellRenderer', () => {
  test('It renders a gene summary link using the id inside parentheses', async () => {
    render(<EnsemblCellRenderer {...params('BRAF (ENSG00000157764)')} />);

    const link = await screen.findByText('ENSG00000157764');
    expect(link).toHaveAttribute(
      'href',
      'http://ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=ENSG00000157764',
    );
  });

  test('It renders a transcript link using the raw value when there are no parentheses', async () => {
    render(<EnsemblCellRenderer {...params('ENST00000288602')} />);

    const link = await screen.findByText('ENST00000288602');
    expect(link).toHaveAttribute(
      'href',
      'http://ensembl.org/Homo_sapiens/Gene/Summary?db=core;t=ENST00000288602',
    );
  });

  test('It opens the link in a new tab', async () => {
    render(<EnsemblCellRenderer {...params('ENST00000288602')} />);

    const link = await screen.findByText('ENST00000288602');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('It renders an empty link when value is falsy', () => {
    const { container } = render(<EnsemblCellRenderer {...params('')} />);

    const link = container.querySelector('a');
    expect(link).toHaveAttribute('href', '');
    expect(link?.textContent).toBe('');
  });
});
