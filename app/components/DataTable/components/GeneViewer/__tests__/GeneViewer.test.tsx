import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';

import ReportContext, { ReportType } from '@/context/ReportContext';
import GeneViewer from '..';

const mockGene = 'TP53';
const mockGeneResults = {
  copyNumber: [],
  expDensityGraph: [],
  expRNA: [],
  kbMatches: [],
  smallMutations: [],
  structuralVariants: [],
};

jest.mock('@/services/api', () => ({
  get: jest.fn(() => ({ request: jest.fn(() => mockGeneResults) })),
}));

const mockReport = {
  ident: '0557a-78bba-2009c-c470f',
} as ReportType;

const withReportContext = (Component) => function ReportContextHOC(props) {
  return (
    <ReportContext.Provider value={{ report: mockReport, setReport: () => {} }}>
      <Component {...props} />
    </ReportContext.Provider>
  );
};

describe('GeneViewer', () => {
  test('It matches the snapshot', () => {
    const Component = withReportContext(GeneViewer);
    const { asFragment } = render(
      <Component
        gene={mockGene}
        isOpen
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
