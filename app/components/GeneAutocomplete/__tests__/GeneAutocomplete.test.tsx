import React, { useMemo } from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';

import ReportContext, { ReportType } from '@/context/ReportContext';
import GeneAutocomplete from '..';

const mockGene = {
  name: 'TP53',
  kbStatementRelated: true,
  drugTargetable: true,
  knownFusionPartner: false,
  knownSmallMutation: false,
  oncogene: false,
  therapeuticAssociated: true,
  tumourSuppressor: true,
};

const mockGene2 = {
  name: 'EGFR',
  kbStatementRelated: false,
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
  get: jest.fn((url) => ({
    request: jest.fn(() => {
      const [, params] = url.split('?');
      const search = new URLSearchParams(params).get('search');
      if (search) {
        return mockGeneOptions.filter(({ name }) => name.includes(search));
      }
      return mockGeneOptions;
    }),
  })),
}));

const withReportContext = (Component) => (function ReportContextHOC(props) {
  const contextValue = useMemo(() => ({
    report: mockReport, setReport: () => { },
  }), []);
  return (
    <ReportContext.Provider value={contextValue}>
      <Component {...props} />
    </ReportContext.Provider>
  );
});

describe('GeneAutocomplete', () => {
  test('A default value is shown', async () => {
    const Component = withReportContext(GeneAutocomplete);
    render(
      <Component
        value={mockGene}
        onChange={() => {}}
      />,
    );

    expect(await screen.findByRole('combobox')).toHaveValue(mockGene.name);
  });

  test('Options are shown when focused', async () => {
    const Component = withReportContext(GeneAutocomplete);
    const { getByText, findByRole } = render(
      <Component
        onChange={() => {}}
      />,
    );
    const geneButton = await findByRole('button');
    fireEvent.click(geneButton);
    await waitFor(() => {
      mockGeneOptions.map(({ name }) => expect(getByText(name)).toBeInTheDocument());
    });
  });

  test('Options are filtered by input text', async () => {
    const Component = withReportContext(GeneAutocomplete);
    const { findByRole, queryByText } = render(
      <Component
        value={mockGene}
        onChange={() => {}}
      />,
    );

    fireEvent.change(await findByRole('combobox'), { target: { value: 'EG' } });
    await waitFor(() => {
      expect(queryByText(mockGene2.name)).toBeInTheDocument();
      expect(queryByText(mockGene.name)).not.toBeInTheDocument();
    });
  });

  test('Options are reset when there is no input text', async () => {
    const Component = withReportContext(GeneAutocomplete);
    const { findByRole, findByText, getByText } = render(
      <Component
        onChange={() => {}}
      />,
    );

    const textInput = await findByRole('combobox');
    fireEvent.change(textInput, { target: { value: 'TP' } });
    fireEvent.click(await findByText(mockGene.name));
    fireEvent.change(textInput, { target: { value: '' } });
    const dropdownButton = await findByRole('button');
    fireEvent.click(dropdownButton);

    await waitFor(() => {
      mockGeneOptions.map(({ name }) => expect(getByText(name)).toBeInTheDocument());
    });
  });

  test('Clicking the autocomplete option fires onChange with the correct params', async () => {
    const mockOnChange = jest.fn();
    const Component = withReportContext(GeneAutocomplete);
    const { findByRole, findByText } = render(
      <Component
        onChange={mockOnChange}
      />,
    );
    const textInput = await findByRole('combobox');
    fireEvent.change(textInput, { target: { value: 'TP' } });

    const option = await findByText(mockGene.name);
    fireEvent.click(option);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(mockGene);
  });
});
