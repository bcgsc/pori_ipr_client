import React from 'react';
import { when, resetAllWhenMocks } from 'jest-when';
import {
  screen, render, waitFor, fireEvent, act,
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
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <ReportContext.Provider value={{ report: mockReport, setReport: () => {}, canEdit: true }}>
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
      />,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  test('It renders the gene name', async () => {
    render(
      <Component
        gene={mockGene}
      />,
    );

    expect(await screen.findByText(mockGene)).toBeInTheDocument();
  });

  test('It renders the gene and the link button, if isLink prop is given', async () => {
    render(
      <Component
        gene={mockGene}
        isLink
      />,
    );

    expect(await screen.findByText(mockGene)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('It renders a modal when the gene name is clicked', async () => {
    render(
      <Component
        gene={mockGene}
        isLink
      />,
    );
    act(() => {
      fireEvent.click(screen.getByRole('button'));
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('Dialog still opens if gene does not exist', async () => {
    when(api.get as (endpoint: string) => Partial<ApiCall>)
      .calledWith(`/reports/${mockReport.ident}/gene-viewer/${mockErrorGene}`)
      .mockImplementation(() => ({ request: async () => { throw new Error(); } }));

    render(
      <Component
        gene={mockErrorGene}
        isLink
      />,
    );
    const button = await screen.findByText(mockErrorGene);
    act(() => {
      fireEvent.click(button);
    });
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    await waitFor(() => {
      expect(dialog).toBeInTheDocument();
    });
  });

  test('Tabs are all shown', async () => {
    when(api.get as (endpoint: string) => Partial<ApiCall>)
      .calledWith(`/reports/${mockReport.ident}/gene-viewer/${mockGene}`)
      .mockImplementation(() => ({ request: async () => mockGeneResults }));

    render(
      <Component
        gene={mockGene}
        isLink
      />,
    );

    const button = await screen.findByText(mockGene);

    act(() => {
      fireEvent.click(button);
    });

    await screen.getByRole('dialog');

    for (const key of Object.keys(mockGeneResults)) {
      screen.getByText(key, { exact: false });
    }
  });
});
