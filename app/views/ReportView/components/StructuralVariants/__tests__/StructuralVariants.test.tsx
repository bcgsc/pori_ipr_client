import React from 'react';
import {
  render, screen, waitFor, fireEvent, within,
} from '@testing-library/react';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import { ApiCallSet } from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import ReportContext from '@/context/ReportContext';
import { makeApiError, mockApiCallSet } from '@/test/apiErrorHelpers';
import StructuralVariants from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');

// [structural-variants, circos images]
const RESOLVED_SET = [[], []];

const renderSection = (setOutcomes: unknown[] = RESOLVED_SET, canEdit = false) => {
  (ApiCallSet as unknown as jest.Mock).mockImplementation(mockApiCallSet(setOutcomes));
  const reportValue = { report: { ident: 'report-1' }, canEdit } as unknown as React.ContextType<typeof ReportContext>;
  return render(
    <ReportContext.Provider value={reportValue}>
      <StructuralVariants />
    </ReportContext.Provider>,
  );
};

describe('StructuralVariants', () => {
  beforeAll(() => {
    ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  test('renders the section', async () => {
    renderSection();

    expect(await screen.findByText('Structural Variation')).toBeInTheDocument();
  });

  test('renders the variant table when only the circos images 404', async () => {
    renderSection([[], makeApiError()]);

    expect(await screen.findByText('Structural Variation')).toBeInTheDocument();
  });

  test('still renders when the variants request 404s', async () => {
    renderSection([makeApiError(), []]);

    expect(await screen.findByText('Structural Variation')).toBeInTheDocument();
  });

  test('still renders when both requests 404', async () => {
    renderSection([makeApiError(), makeApiError()]);

    expect(await screen.findByText('Structural Variation')).toBeInTheDocument();
  });

  test('shows the oncogene and tumour suppressor columns by default', async () => {
    const gene = {
      name: 'GENEA',
      oncogene: true,
      tumourSuppressor: true,
      expressionVariants: {
        rpkm: null, primarySiteFoldChange: null, tpm: 1, diseasePercentile: 1, diseaseZScore: 1, primarySitekIQR: 1,
      },
    };
    const sv = {
      ident: 'sv-1',
      gene1: gene,
      gene2: gene,
      exon1: '1',
      exon2: '2',
      breakpoint: 'chr1:100|chr2:200',
      eventType: 'fusion',
      detectedIn: 'tumour',
      conventionalName: 'conv',
      kbMatches: [{ kbMatchedStatements: [{ category: 'therapeutic' }] }],
    };
    renderSection([[sv], []]);

    expect(await screen.findByText('Oncogene')).toBeInTheDocument();
    expect(await screen.findByText('Tumour Suppressor Gene')).toBeInTheDocument();
  });

  test('toggling a column on applies it to every category table', async () => {
    /*
      The four category tables share one visibleCols state, and a report routinely
      leaves some categories empty. Toggling from one table's picker must reach the
      others, including the empty ones - they never fire onFirstDataRendered, which
      previously left them stuck on their initial columns.
    */
    const makeGene = () => ({
      name: 'GENEA',
      oncogene: false,
      tumourSuppressor: false,
      kbStatementRelated: true,
      expressionVariants: {
        rpkm: 1, primarySiteFoldChange: 1, tpm: 1, diseasePercentile: 1, diseaseZScore: 1, primarySitekIQR: 1,
      },
    });
    const makeSv = (ident: string, category: string) => ({
      ident,
      gene1: makeGene(),
      gene2: makeGene(),
      exon1: '1',
      exon2: '2',
      breakpoint: `chr1:${ident}`,
      eventType: 'fusion',
      detectedIn: 'tumour',
      conventionalName: 'conv',
      kbMatches: [{ kbMatchedStatements: [{ category }] }],
    });
    /* only 'unknown' has rows; the other three categories render empty */
    const svs = Array.from({ length: 3 }, (_, i) => makeSv(`u${i}`, 'none'));
    const target = 'In Knowledgebase Gene';
    const headerCount = () => screen.queryAllByText(target)
      .filter((el) => el.classList.contains('ag-header-cell-text')).length;

    renderSection([svs, []], true);
    await screen.findByText('Structural Variation');
    await waitFor(() => expect(document.querySelectorAll('.ag-root')).toHaveLength(4));
    expect(headerCount()).toBe(0);

    /* drive the picker on the first table, not the one holding the rows */
    fireEvent.click(screen.getAllByTestId('MoreHorizIcon')[0].closest('button'));
    fireEvent.click(await screen.findByText('Toggle Columns'));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('checkbox', { name: target }));
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    await waitFor(() => expect(headerCount()).toBe(4));
  });

  test('names the failed request in the snackbar', async () => {
    renderSection([[], makeApiError()]);

    await screen.findByText('Structural Variation');
    await waitFor(() => expect(snackbar.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load circos plots'),
    ));
  });
});
