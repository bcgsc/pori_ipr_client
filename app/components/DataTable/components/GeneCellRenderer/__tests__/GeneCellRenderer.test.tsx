import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';

import GeneCellRenderer from '..';

const mockGene = 'EGFR';
const mockFusionCommas = 'CABLES1,DCC';
const mockFusionColons = 'CABLES1 :: DCC';
const expectedFusions = ['CABLES1', 'DCC'];

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

  test('It renders the gene and the link button', async () => {
    render(
      <GeneCellRenderer
        value={mockGene}
        link
      />,
    );

    expect(await screen.findByText(mockGene)).toBeInTheDocument();
    expect(await screen.findByRole('button')).toBeInTheDocument();
  });

  test('It renders the gene without a link button', async () => {
    render(
      <GeneCellRenderer
        value={mockGene}
        link={false}
      />,
    );

    expect(await screen.findByText(mockGene)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('It renders a fusion gene with a comma', async () => {
    render(
      <GeneCellRenderer
        value={mockFusionCommas}
        link={false}
      />,
    );

    expectedFusions.forEach((fusion) => {
      expect(screen.getByText(fusion)).toBeInTheDocument();
    });
    expect(screen.getByText(',')).toBeInTheDocument();
  });

  test('It renders a fusion gene with colons', async () => {
    render(
      <GeneCellRenderer
        value={mockFusionColons}
        link={false}
      />,
    );

    expectedFusions.forEach((fusion) => {
      expect(screen.getByText(fusion)).toBeInTheDocument();
    });
    expect(screen.getByText('::')).toBeInTheDocument();
  });

  test('The GeneViewer is shown upon link button click', async () => {
    render(
      <GeneCellRenderer
        value={mockGene}
        link
      />,
    );

    fireEvent.click(await screen.findByRole('button'));
    expect(await screen.findByRole('presentation')).toBeInTheDocument();
  });
});
