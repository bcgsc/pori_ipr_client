import React from 'react';
import '@testing-library/jest-dom';
import { screen, render } from '@testing-library/react';

import GeneCellRenderer from '..';

const mockGene = 'EGFR';
const mockFusionCommas = 'CABLES1,DCC';
const mockFusionColons = 'CABLES1 :: DCC';
// eslint-disable-next-line react/display-name
jest.mock('../../GeneViewer', () => () => (<div role="presentation" />));

describe('GeneCellRenderer', () => {
  test('It matches the snapshot', () => {
    const { asFragment } = render(
      <GeneCellRenderer
        value={mockGene}
        link
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test('It renders a fusion gene with a comma', async () => {
    render(
      <GeneCellRenderer
        value={mockFusionCommas}
        link={false}
      />,
    );

    expect(screen.getByText(',')).toBeInTheDocument();
  });

  test('It renders a fusion gene with colons', async () => {
    render(
      <GeneCellRenderer
        value={mockFusionColons}
        link={false}
      />,
    );

    expect(screen.getByText('::')).toBeInTheDocument();
  });
});
