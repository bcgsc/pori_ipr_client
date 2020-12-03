import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import {
  comparators,
  mutationBurden,
  barplots,
  densities,
  legends,
} from './mockData';
import TabCards from '..';

describe('TabCards SNV', () => {
  let queryFunctions;

  beforeEach(() => {
    queryFunctions = render(
      <TabCards
        comparators={comparators}
        mutationBurden={mutationBurden}
        type="SNV"
        barplots={barplots}
        densities={densities}
        legends={legends}
      />,
    );
  });

  test('Primary comparator tab is present', () => {
    const { getByText } = queryFunctions;
    expect(getByText('primary')).toBeInTheDocument();
  });

  test('Secondary comparator tab is present', () => {
    const { getByText } = queryFunctions;
    expect(getByText('secondary')).toBeInTheDocument();
  });

  test('TCGA is the primary comparator', () => {
    const { getByText } = queryFunctions;
    expect(getByText('Comparator: TCGA (primary)')).toBeInTheDocument();
  });

  test('POG primary SV comparator is not present for SNV', () => {
    const { queryByText } = queryFunctions;
    expect(queryByText('Comparator: POG (primary)')).not.toBeInTheDocument();
  });

  test('Secondary comparator is visible on tab change', async () => {
    const { getByText, container } = queryFunctions;
    const secondaryTabButton = container.querySelector('button[aria-selected="false"]');
    await fireEvent.click(secondaryTabButton);
    expect(getByText('Comparator: TCGA (secondary)')).toBeInTheDocument();
  });

  test('Barplot image is shown', () => {
    const { getAllByText } = queryFunctions;
    expect(getAllByText('SNV barplot image').length).toBeGreaterThanOrEqual(1);
  });

  test('Density image is shown', () => {
    const { getAllByText } = queryFunctions;
    expect(getAllByText('SNV density image').length).toBeGreaterThanOrEqual(1);
  });

  test('Legend image is shown', () => {
    const { getAllByAltText } = queryFunctions;
    expect(getAllByAltText('SNV legend image').length).toBeGreaterThanOrEqual(1);
  });
});

describe('TabCards SV overload', () => {
  let queryFunctions;

  beforeEach(() => {
    queryFunctions = render(
      <TabCards
        comparators={comparators}
        mutationBurden={mutationBurden}
        type="SV"
        barplots={barplots}
        densities={densities}
        legends={legends}
      />,
    );
  });

  test('POG primary SV comparator overloads non-SV comparator', () => {
    const { getByText } = queryFunctions;
    expect(getByText('Comparator: POG (primary)')).toBeInTheDocument();
  });
});
