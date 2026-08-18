import React from 'react';
import { render, screen } from '@testing-library/react';

import TestInformation, { TestInformationType } from '..';

const mockData = {
  fusionGenes: 'FG',
  fusionProbe: 'FP',
  fusionVars: 'FV',
  kbVersion: 'KB1',
  snpGenes: 'SG',
  snpProbe: 'SP',
  snpVars: 'SV',
  cancerVars: 'CV',
  cancerGenes: 'CG',
  pharmacogenomicGenes: 'PG',
  pharmacogenomicVars: 'PV',
} as unknown as TestInformationType;

describe('TestInformation', () => {
  test('shows somatic fields when not pharmacogenomic', () => {
    render(<TestInformation data={mockData} isPharmacogenomic={false} />);

    expect(screen.getByText('Genes Screened')).toBeInTheDocument();
    expect(screen.getByText('Fusion Probe Version')).toBeInTheDocument();
    expect(screen.queryByText('Pharmacogenomic Genes Screened')).toBeNull();
  });

  test('shows pharmacogenomic and cancer-predisposition fields when pharmacogenomic', () => {
    render(<TestInformation data={mockData} isPharmacogenomic />);

    expect(screen.getByText('Pharmacogenomic Genes Screened')).toBeInTheDocument();
    expect(screen.getByText('Cancer Predisposition Genes Screened')).toBeInTheDocument();
    expect(screen.queryByText('Fusion Probe Version')).toBeNull();
  });
});
