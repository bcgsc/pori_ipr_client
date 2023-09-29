import React from 'react';
import { when, resetAllWhenMocks } from 'jest-when';
import {
  screen, render, waitFor,
} from '@testing-library/react';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import ReportContext, { ReportType } from '@/context/ReportContext';
import api, { ApiCall } from '@/services/api';
import GeneViewer from '..';

const mockGene = 'TP53';
const mockErrorGene = 'NonExistent25';
const mockGeneResults = {
  copyNumber: [],
  expDensityGraph: [],
  expRNA: [],
  kbMatches: [],
  smallMutations: [],
  structuralVariants: [],
};

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');

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
  let Component;
  beforeAll(() => {
    jest.resetModules();
    ModuleRegistry.registerModules([
      ClientSideRowModelModule,
    ]);
  });
  beforeEach(() => {
    Component = withReportContext(GeneViewer);
    resetAllWhenMocks();
  });

  test('It matches the snapshot', () => {
    const { asFragment } = render(
      <Component
        gene={mockGene}
        isOpen
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test('It calls onClose if the gene does not exist', async () => {
    when(api.get as (endpoint: string) => Partial<ApiCall>)
      .calledWith(`/reports/${mockReport.ident}/gene-viewer/${mockErrorGene}`)
      .mockImplementation(() => ({ request: async () => { throw new Error(); } }));

    const mockOnClose = jest.fn();

    render(
      <Component
        gene={mockErrorGene}
        isOpen
        onClose={mockOnClose}
      />,
    );

    await waitFor(() => expect(mockOnClose).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockOnClose).toHaveBeenCalledWith());
  });

  test('Tabs are all shown', async () => {
    when(api.get as (endpoint: string) => Partial<ApiCall>)
      .calledWith(`/reports/${mockReport.ident}/gene-viewer/${mockGene}`)
      .mockImplementation(() => ({ request: async () => mockGeneResults }));

    render(
      <Component
        gene={mockGene}
        isOpen
        onClose={() => {}}
      />,
    );

    const promises = [];
    for (const key of Object.keys(mockGeneResults)) {
      promises.push(screen.findByText(key, { exact: false }));
    }
    const resolved = await Promise.all(promises);
    for (const elem of resolved) {
      expect(elem).toBeInTheDocument();
    }
  });
});
