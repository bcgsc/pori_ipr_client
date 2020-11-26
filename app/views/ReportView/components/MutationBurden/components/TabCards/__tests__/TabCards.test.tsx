import React from 'react';
import { render } from '@testing-library/react';

import TabCards from '..';

describe('Tab Cards Component', () => {
  test('Header text is in the document', async () => {
    const comparators = [
      {
        analysisRole: 'mutation burden (primary)',
        createdAt: '',
        description: '',
        ident: '',
        name: 'POG',
        size: null,
        updatedAt: null,
        version: null,
      },
    ];

    const mutationBurden = [
      {
        codingIndelPercentile: 24,
        codingIndelsCount: 1,
        codingSnvCount: 10,
        codingSnvPercentile: 10,
        createdAt: 'now',
        frameshiftIndelsCount: 1,
        ident: 'e',
        qualitySvCount: 53,
        qualitySvExpressedCount: 14,
        qualitySvPercentile: 92,
        role: 'primary',
        totalIndelCount: null,
        totalMutationsPerMb: 1.98,
        totalSnvCount: null,
        truncatingSnvCount: 1,
        updatedAt: '',
      },
    ];

    const barplots = [
      {
        caption: null,
        createdAt: '',
        data: '',
        filename: '',
        format: 'PNG',
        ident: '',
        key: '',
        title: '',
        updatedAt: '',
      },
    ];

    const densities = [
      {
        caption: null,
        createdAt: '',
        data: '',
        filename: '',
        format: 'PNG',
        ident: '',
        key: '',
        title: '',
        updatedAt: '',
      },
    ];

    const legends = [
      {
        caption: null,
        createdAt: '',
        data: '',
        filename: '',
        format: 'PNG',
        ident: '',
        key: '',
        title: '',
        updatedAt: '',
      },
    ];

    const { getByText } = render(
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
});
