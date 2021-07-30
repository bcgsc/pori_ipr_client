import React from 'react';
import { render, screen } from '@testing-library/react';

import CivicCellRenderer from '..';

const mockCivicData = {
  externalSource: 'CIVIC',
  externalStatementId: '521',
};

const mockNonCivicData = {
  externalSource: 'GKB',
  externalStatementId: '1100',
};

describe('CivicCellRenderer', () => {
  test('externalSource text is visible', async () => {
    render(
      <CivicCellRenderer
        data={mockCivicData}
      />,
    );
    expect(await screen.findByText('CIVIC')).toBeInTheDocument();
  });

  test('A link to CIVIC is rendered when available', async () => {
    render(
      <CivicCellRenderer
        data={mockCivicData}
      />,
    );
    expect(
      await screen.findByRole('link', { name: mockCivicData.externalSource }),
    ).toBeInTheDocument();
  });

  test('The CIVIC link is formatted properly', async () => {
    render(
      <CivicCellRenderer
        data={mockCivicData}
      />,
    );
    
    expect(
      await screen.findByRole('link', { name: 'CIVIC' }),
    ).toHaveAttribute('href', `https://civicdb.org/links/evidence/${mockCivicData.externalStatementId}`);
  });

  test('Text is rendered for non-CIVIC data', async () => {
    render(
      <CivicCellRenderer
        data={mockNonCivicData}
      />,
    );
    expect(await screen.findByText(mockNonCivicData.externalSource)).toBeInTheDocument();
  });

  test('A link is not rendered for non-CIVIC data', async () => {
    render(
      <CivicCellRenderer
        data={mockNonCivicData}
      />,
    );
    expect(screen.queryByRole('link', { name: mockNonCivicData.externalSource })).toBeNull();
  });
});
