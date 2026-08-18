import React from 'react';
import { render, screen } from '@testing-library/react';

import SummaryPrintTable from '..';

describe('SummaryPrintTable', () => {
  test('renders label/value rows and filters out null and empty values', () => {
    render(
      <SummaryPrintTable
        labelKey="label"
        valueKey="value"
        data={[
          { label: 'Gene', value: 'TP53' },
          { label: 'EmptyRow', value: '' },
          { label: 'NullRow', value: null },
        ]}
      />,
    );

    expect(screen.getByText('Gene')).toBeInTheDocument();
    expect(screen.getByText('TP53')).toBeInTheDocument();
    expect(screen.queryByText('EmptyRow')).toBeNull();
    expect(screen.queryByText('NullRow')).toBeNull();
  });

  test('maps variant-type labels to readable, pluralized names', () => {
    render(
      <SummaryPrintTable
        labelKey="label"
        valueKey="value"
        data={[{ label: 'cnv', value: ['gene1', 'gene2'] }]}
      />,
    );

    expect(screen.getByText('CNVs')).toBeInTheDocument();
  });

  test('uses renderValue to format the value when provided', () => {
    render(
      <SummaryPrintTable
        labelKey="label"
        valueKey="value"
        data={[{ label: 'Gene', value: 'TP53' }]}
        renderValue={(value) => `rendered:${value}`}
      />,
    );

    expect(screen.getByText('rendered:TP53')).toBeInTheDocument();
  });
});
