import React from 'react';
import {
  render, screen, fireEvent,
} from '@testing-library/react';

import ReportContext, { ReportType } from '@/context/ReportContext';
import GeneAutocomplete from '..';

const mockGene = {
  name: 'TP53',
  cancerRelated: true,
  drugTargetable: true,
  knownFusionPartner: false,
  knownSmallMutation: false,
  oncogene: false,
  therapeuticAssociated: true,
  tumourSuppressor: true,
};

const mockGene2 = {
  name: 'EGFR',
  cancerRelated: false,
  drugTargetable: false,
  knownFusionPartner: true,
  knownSmallMutation: true,
  oncogene: true,
  therapeuticAssociated: false,
  tumourSuppressor: false,
};

const mockGeneOptions = [mockGene, mockGene2];

const mockReport = {
  ident: '0557a-78bba-2009c-c470f',
} as ReportType;

jest.mock('@/services/api', () => ({
  get: jest.fn(() => ({ request: jest.fn(() => mockGeneOptions) })),
}));

const withReportContext = (Component) => (function ReportContextHOC(props) {
  return (
    <ReportContext.Provider value={{ report: mockReport, setReport: () => {} }}>
      <Component {...props} />
    </ReportContext.Provider>
  );
});

describe('GeneAutocomplete', () => {
  test('A default value is shown', async () => {
    const Component = withReportContext(GeneAutocomplete);
    render(
      <Component
        defaultValue={mockGene}
        onChange={() => {}}
      />,
    );

    expect(await screen.findByRole('textbox')).toHaveValue(mockGene.name);
  });

  test('Options are shown when focused', async () => {
    const Component = withReportContext(GeneAutocomplete);
    render(
      <Component
        defaultValue={mockGene}
        onChange={() => {}}
      />,
    );
    fireEvent.click(await screen.findByRole('button'));

    const elems = await Promise.all(mockGeneOptions.map((option) => (
      screen.findByText(option.name)
    )));
    elems.forEach((elem) => expect(elem).toBeInTheDocument());
  });

  test('Options are filtered by input text', async () => {
    const Component = withReportContext(GeneAutocomplete);
    render(
      <Component
        defaultValue={mockGene}
        onChange={() => {}}
      />,
    );

    fireEvent.change(await screen.findByRole('textbox'), { target: { value: 'TP' } });

    expect(await screen.findByText(mockGene.name)).toBeInTheDocument();
    expect(screen.queryByText(mockGene2.name)).toBeNull();
  });

  test('Options are reset when there is no input text', async () => {
    const Component = withReportContext(GeneAutocomplete);
    render(
      <Component
        onChange={() => {}}
      />,
    );

    fireEvent.change(await screen.findByRole('textbox'), { target: { value: 'TP' } });
    fireEvent.click(await screen.findByText(mockGene.name));
    fireEvent.change(await screen.findByRole('textbox'), { target: { value: '' } });
    fireEvent.click(await screen.findByRole('button'));

    mockGeneOptions.forEach((option) => {
      expect(screen.getByText(option.name)).toBeTruthy();
    });
  });

  test('Clicking the autocomplete option fills the textbox and fires onChange', async () => {
    const mockOnChange = jest.fn();
    const Component = withReportContext(GeneAutocomplete);
    render(
      <Component
        onChange={mockOnChange}
      />,
    );

    fireEvent.change(await screen.findByRole('textbox'), { target: { value: 'TP' } });
    fireEvent.click(await screen.findByText(mockGene.name));

    expect(await screen.findByRole('textbox')).toHaveValue(mockGene.name);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(mockGene);
  });
});
