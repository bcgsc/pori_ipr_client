import React, { act } from 'react';
import {
  render, screen, fireEvent, waitFor, within,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ColumnApi, ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import ReportContext from '@/context/ReportContext';
import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import { ReportType } from '@/common';
import Therapeutic, {
  orderRankStartingByZero,
  removeExtraProps,
  filterType,
  reorderByRank,
} from '..';
import { TherapeuticType } from '../types';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');

type EditDialogMockProps = {
  isOpen: boolean;
  onClose: (newData?: Record<string, unknown> | null) => void;
  editData: Record<string, unknown>;
  tableType: string;
};

// EditDialog and the print table are heavy children with their own data flows;
// stub them so these tests stay focused on the Therapeutic container's logic.
let mockEditDialogProps: EditDialogMockProps | null = null;
jest.mock('../components/EditDialog', () => {
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  const ReactLib = require('react');
  return {
    __esModule: true,
    default: (props: EditDialogMockProps) => {
      mockEditDialogProps = props;
      return ReactLib.createElement('div', { 'data-testid': 'edit-dialog' });
    },
  };
});

jest.mock('../components/TherapeuticTargetPrintTable', () => {
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  const ReactLib = require('react');
  return {
    __esModule: true,
    default: () => ReactLib.createElement('div', { 'data-testid': 'print-table' }),
  };
});

// `template` is required: useConfirmDialog reads report.template.name.
const mockReport = {
  ident: 'report-1',
  template: { name: 'genomic' },
} as unknown as ReportType;

const mockTherapeuticTargets = [
  {
    ident: 't1', type: 'therapeutic', gene: 'TP53', rank: 2, variant: 'mut-x', therapy: 'Drug-A', context: 'ctx-A', evidenceLevel: 'IPR-A', iprEvidenceLevel: 'A', notes: '',
  },
  {
    ident: 't2', type: 'therapeutic', gene: 'BRCA1', rank: 0, variant: 'mut-y', therapy: 'Drug-B', context: 'ctx-B', evidenceLevel: 'IPR-B', iprEvidenceLevel: 'B', notes: '',
  },
  {
    ident: 't3', type: 'therapeutic', gene: 'EGFR', rank: 1, variant: 'mut-z', therapy: 'Drug-C', context: 'ctx-C', evidenceLevel: 'IPR-C', iprEvidenceLevel: 'C', notes: '',
  },
  {
    ident: 'c1', type: 'chemoresistance', gene: 'KRAS', rank: 0, variant: 'mut-k', therapy: 'Drug-K', context: 'ctx-K', evidenceLevel: 'IPR-K', iprEvidenceLevel: 'K', notes: '',
  },
];

const renderTherapeutic = (
  canEdit = true,
  isPrint = false,
  printVersion: 'standardLayout' | 'condensedLayout' | null = null,
) => {
  // Fresh client per render so react-query cache never leaks between tests.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ReportContext.Provider
        value={{
          canEdit,
          report: mockReport,
          reportTemplateName: '',
          refetchReport: () => null,
        }}
      >
        <Therapeutic isPrint={isPrint} printVersion={printVersion} />
      </ReportContext.Provider>
    </QueryClientProvider>,
  );
};

const flushPromises = () => act(async () => {
  await new Promise((resolve) => { setTimeout(resolve, 0); });
});

const tableContainerFor = async (titleText: string): Promise<HTMLElement> => {
  const heading = await screen.findByText(titleText);
  return heading.closest('.data-table') as HTMLElement;
};

const openMenu = (tableContainer: HTMLElement) => {
  const trigger = tableContainer.querySelector('.data-table__icon-button') as HTMLElement;
  fireEvent.click(trigger);
};

const closeOpenMenu = async () => {
  const menu = screen.queryByRole('menu');
  if (!menu) return;
  fireEvent.keyDown(menu, { key: 'Escape', code: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
};

const clickMenuItem = async (label: string | RegExp) => {
  const menu = await screen.findByRole('menu');
  const item = within(menu).getByText(label);
  fireEvent.click(item);
  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
};

// Resolve the row-action button (edit/delete) for a given gene. The actions
// column is pinned right, so it lives in a separate .ag-row from the gene cell;
// both share the same row-index attribute.
const actionButtonInRow = (
  tableContainer: HTMLElement,
  gene: string,
  testId: 'edit' | 'delete',
): Element | null => {
  const geneCell = within(tableContainer).getByText(gene);
  const rowIndex = geneCell.closest('.ag-row')?.getAttribute('row-index');
  return tableContainer.querySelector(
    `.ag-row[row-index="${rowIndex}"] [data-testid="${testId}"]`,
  );
};

beforeAll(() => {
  ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);
});

beforeEach(() => {
  jest.clearAllMocks();
  mockEditDialogProps = null;
  (api.get as jest.Mock).mockReturnValue({
    request: jest.fn().mockResolvedValue(mockTherapeuticTargets),
  });
  (api.put as jest.Mock).mockReturnValue({
    request: jest.fn().mockResolvedValue({}),
  });
  (api.del as jest.Mock).mockReturnValue({
    request: jest.fn().mockResolvedValue({}),
  });
});

describe('TherapeuticTargets — helper functions', () => {
  describe('orderRankStartingByZero', () => {
    test('Sorts rows by rank ascending and reassigns ranks contiguously from zero', () => {
      const a = { rank: 5 };
      const b = { rank: 2 };
      const c = { rank: 9 };
      const result = orderRankStartingByZero([a, b, c]);

      expect(result).toEqual([b, a, c]);
      expect(b.rank).toBe(0);
      expect(a.rank).toBe(1);
      expect(c.rank).toBe(2);
    });

    test('Leaves already ordered rows in place', () => {
      const result = orderRankStartingByZero([{ rank: 0 }, { rank: 1 }, { rank: 2 }]);
      expect(result.map((row) => row.rank)).toEqual([0, 1, 2]);
    });
  });

  describe('removeExtraProps', () => {
    test('Keeps only the display fields and drops the rest', () => {
      const result = removeExtraProps(mockTherapeuticTargets as unknown as TherapeuticType[]);
      expect(Object.keys(result[0]).sort()).toEqual([
        'context', 'evidenceLevel', 'gene', 'iprEvidenceLevel',
        'notes', 'rank', 'signature', 'therapy', 'variant',
      ]);
    });

    test('Drops identifiers such as ident and type', () => {
      const result = removeExtraProps(mockTherapeuticTargets as unknown as TherapeuticType[]);
      expect(result[0]).not.toHaveProperty('ident');
      expect(result[0]).not.toHaveProperty('type');
    });
  });

  describe('filterType', () => {
    test('Splits rows into the two requested type buckets', () => {
      const [therapeutic, chemoresistance] = filterType(
        mockTherapeuticTargets as unknown as TherapeuticType[],
        'therapeutic',
        'chemoresistance',
      );
      expect(therapeutic.map((row) => row.ident)).toEqual(['t1', 't2', 't3']);
      expect(chemoresistance.map((row) => row.ident)).toEqual(['c1']);
    });

    test('Ignores rows that match neither type', () => {
      const rows = [
        { ident: 'x', type: 'other' },
        { ident: 't', type: 'therapeutic' },
      ] as unknown as TherapeuticType[];
      const [therapeutic, chemoresistance] = filterType(rows, 'therapeutic', 'chemoresistance');
      expect(therapeutic.map((row) => row.ident)).toEqual(['t']);
      expect(chemoresistance).toHaveLength(0);
    });
  });

  describe('reorderByRank', () => {
    const ranked = (idents: string[]) => idents.map((ident, rank) => ({ ident, rank }));

    test('Moving a row down shifts the rows in between up by one', () => {
      const result = reorderByRank(ranked(['a', 'b', 'c', 'd', 'e']), 1, 3) as {
        ident: string; rank: number;
      }[];
      expect(result.map((row) => row.ident)).toEqual(['a', 'b', 'c', 'd', 'e']);
      expect(result.map((row) => row.rank)).toEqual([0, 3, 1, 2, 4]);
    });

    test('Moving a row up shifts the rows in between down by one', () => {
      const result = reorderByRank(ranked(['a', 'b', 'c', 'd', 'e']), 3, 1) as {
        ident: string; rank: number;
      }[];
      expect(result.map((row) => row.rank)).toEqual([0, 2, 3, 1, 4]);
    });

    test('Normalises non-contiguous ranks before reordering', () => {
      const rows = [
        { ident: 'a', rank: 10 },
        { ident: 'b', rank: 20 },
        { ident: 'c', rank: 30 },
      ];
      const result = reorderByRank(rows, 0, 2) as { ident: string; rank: number }[];
      expect(result.map((row) => row.rank)).toEqual([2, 0, 1]);
    });

    test('Does not mutate the input array', () => {
      const rows = ranked(['a', 'b', 'c']);
      const snapshot = JSON.parse(JSON.stringify(rows));
      reorderByRank(rows, 0, 2);
      expect(rows).toEqual(snapshot);
    });
  });
});

describe('TherapeuticTargets — data loading', () => {
  test('Fetches therapeutic targets for the active report on mount', async () => {
    renderTherapeutic();
    await screen.findByText('TP53');
    expect(api.get).toHaveBeenCalledWith('/reports/report-1/therapeutic-targets');
  });

  test('Therapeutic-type rows render in the Potential Therapeutic Targets table', async () => {
    renderTherapeutic();
    const container = await tableContainerFor('Potential Therapeutic Targets');
    expect(await within(container).findByText('TP53')).toBeInTheDocument();
    expect(within(container).getByText('BRCA1')).toBeInTheDocument();
    expect(within(container).getByText('EGFR')).toBeInTheDocument();
    expect(within(container).queryByText('KRAS')).toBeNull();
  });

  test('Chemoresistance-type rows render in the Potential Resistance and Toxicity table', async () => {
    renderTherapeutic();
    const container = await tableContainerFor('Potential Resistance and Toxicity');
    expect(await within(container).findByText('KRAS')).toBeInTheDocument();
    expect(within(container).queryByText('TP53')).toBeNull();
  });

  test('Therapeutic rows are displayed in ascending rank order', async () => {
    renderTherapeutic();
    const container = await tableContainerFor('Potential Therapeutic Targets');
    await within(container).findByText('TP53');

    const rowIndexFor = (gene: string) => Number(
      within(container).getByText(gene).closest('.ag-row')?.getAttribute('row-index'),
    );
    expect([rowIndexFor('BRCA1'), rowIndexFor('EGFR'), rowIndexFor('TP53')]).toEqual([0, 1, 2]);
  });

  test('Shows an error snackbar when the fetch fails', async () => {
    (api.get as jest.Mock).mockReturnValue({
      request: jest.fn().mockRejectedValue(new Error('network down')),
    });
    renderTherapeutic();
    await waitFor(() => {
      expect(snackbar.error).toHaveBeenCalledWith(expect.stringContaining('network down'));
    });
  });

  test('Renders no tables while the fetch is in flight', async () => {
    let resolveFetch!: (value: unknown) => void;
    (api.get as jest.Mock).mockReturnValue({
      request: () => new Promise((resolve) => { resolveFetch = resolve; }),
    });
    renderTherapeutic();

    expect(screen.queryByText('Potential Therapeutic Targets')).toBeNull();

    await act(async () => {
      resolveFetch(mockTherapeuticTargets);
    });
    expect(await screen.findByText('Potential Therapeutic Targets')).toBeInTheDocument();
  });
});

describe('TherapeuticTargets — add and edit flow', () => {
  test('The edit dialog is not rendered until an edit or add is started', async () => {
    renderTherapeutic();
    await screen.findByText('TP53');
    expect(screen.queryByTestId('edit-dialog')).toBeNull();
  });

  test("Clicking a row's edit action opens the edit dialog with that row's data", async () => {
    renderTherapeutic();
    const container = await tableContainerFor('Potential Therapeutic Targets');
    await within(container).findByText('TP53');

    fireEvent.click(actionButtonInRow(container, 'TP53', 'edit') as Element);

    expect(await screen.findByTestId('edit-dialog')).toBeInTheDocument();
    expect(mockEditDialogProps?.isOpen).toBe(true);
    expect(mockEditDialogProps?.editData.ident).toBe('t1');
  });

  test('Clicking the table add action opens the edit dialog for a new entry', async () => {
    renderTherapeutic();
    const container = await tableContainerFor('Potential Therapeutic Targets');
    await within(container).findByText('TP53');

    openMenu(container);
    await clickMenuItem('Add row');

    expect(await screen.findByTestId('edit-dialog')).toBeInTheDocument();
    expect(mockEditDialogProps?.editData).toEqual({ type: 'therapeutic' });
  });

  test('Closing the dialog with updated data shows a success snackbar and refetches', async () => {
    renderTherapeutic();
    const container = await tableContainerFor('Potential Therapeutic Targets');
    await within(container).findByText('TP53');

    fireEvent.click(actionButtonInRow(container, 'TP53', 'edit') as Element);
    await screen.findByTestId('edit-dialog');
    const getCallsBefore = (api.get as jest.Mock).mock.calls.length;

    await act(async () => {
      mockEditDialogProps?.onClose({ ...mockTherapeuticTargets[0], notes: 'updated note' });
    });

    expect(snackbar.success).toHaveBeenCalledWith('Row updated');
    // handleEditClose triggers a react-query refetch, which re-hits api.get.
    await waitFor(() => {
      expect((api.get as jest.Mock).mock.calls.length).toBeGreaterThan(getCallsBefore);
    });
    expect(screen.queryByTestId('edit-dialog')).toBeNull();
  });

  test('Closing the dialog without data leaves the tables unchanged', async () => {
    renderTherapeutic();
    const container = await tableContainerFor('Potential Therapeutic Targets');
    await within(container).findByText('TP53');

    fireEvent.click(actionButtonInRow(container, 'TP53', 'edit') as Element);
    await screen.findByTestId('edit-dialog');
    const getCallsBefore = (api.get as jest.Mock).mock.calls.length;

    await act(async () => {
      mockEditDialogProps?.onClose();
    });

    expect(snackbar.success).not.toHaveBeenCalledWith('Row updated');
    expect((api.get as jest.Mock).mock.calls.length).toBe(getCallsBefore);
    expect(screen.queryByTestId('edit-dialog')).toBeNull();
  });
});

describe('TherapeuticTargets — delete flow', () => {
  test('Deleting a row calls the delete endpoint with the row ident', async () => {
    renderTherapeutic();
    const container = await tableContainerFor('Potential Therapeutic Targets');
    await within(container).findByText('TP53');

    fireEvent.click(actionButtonInRow(container, 'TP53', 'delete') as Element);

    await waitFor(() => {
      expect(api.del).toHaveBeenCalledWith('/reports/report-1/therapeutic-targets/t1', {});
    });
    await flushPromises();
  });

  test('A successful delete shows a success snackbar and refetches', async () => {
    renderTherapeutic();
    const container = await tableContainerFor('Potential Therapeutic Targets');
    await within(container).findByText('TP53');
    const getCallsBefore = (api.get as jest.Mock).mock.calls.length;

    fireEvent.click(actionButtonInRow(container, 'TP53', 'delete') as Element);

    await waitFor(() => {
      expect(snackbar.success).toHaveBeenCalledWith('Successfully deleted t1');
    });
    await waitFor(() => {
      expect((api.get as jest.Mock).mock.calls.length).toBeGreaterThan(getCallsBefore);
    });
    await flushPromises();
  });

  test('A failed delete shows an error snackbar', async () => {
    (api.del as jest.Mock).mockReturnValue({
      request: jest.fn().mockRejectedValue(new Error('cannot delete')),
    });
    renderTherapeutic();
    const container = await tableContainerFor('Potential Therapeutic Targets');
    await within(container).findByText('TP53');

    fireEvent.click(actionButtonInRow(container, 'TP53', 'delete') as Element);

    await waitFor(() => {
      expect(snackbar.error).toHaveBeenCalled();
    });
    await flushPromises();
  });
});

describe('TherapeuticTargets — print layouts', () => {
  test('standardLayout print renders both print tables with section headings', async () => {
    renderTherapeutic(true, true, 'standardLayout');
    await flushPromises();

    expect(screen.getByText('Potential Therapeutic Targets')).toBeInTheDocument();
    expect(screen.getByText('Potential Resistance and Toxicity')).toBeInTheDocument();
    expect(screen.getAllByTestId('print-table')).toHaveLength(2);
  });

  test('condensedLayout print renders the condensed print tables', async () => {
    renderTherapeutic(true, true, 'condensedLayout');
    await flushPromises();

    expect(screen.getByText('Potential Therapeutic Targets')).toBeInTheDocument();
    expect(screen.getByText('Potential Resistance and Toxicity')).toBeInTheDocument();
    expect(screen.getAllByTestId('print-table')).toHaveLength(2);
  });
});

describe('TherapeuticTargets — edit permissions', () => {
  test('Edit, delete, and add actions are available when canEdit is true', async () => {
    renderTherapeutic(true);
    const container = await tableContainerFor('Potential Therapeutic Targets');
    await within(container).findByText('TP53');

    expect(actionButtonInRow(container, 'TP53', 'edit')).not.toBeNull();
    expect(actionButtonInRow(container, 'TP53', 'delete')).not.toBeNull();

    openMenu(container);
    const menu = await screen.findByRole('menu');
    expect(within(menu).getByText('Add row')).toBeInTheDocument();
  });

  test('Edit, delete, and add actions are hidden when canEdit is false', async () => {
    renderTherapeutic(false);
    const container = await tableContainerFor('Potential Therapeutic Targets');
    await within(container).findByText('TP53');

    expect(actionButtonInRow(container, 'TP53', 'edit')).toBeNull();
    expect(actionButtonInRow(container, 'TP53', 'delete')).toBeNull();

    openMenu(container);
    const menu = await screen.findByRole('menu');
    expect(within(menu).queryByText('Add row')).toBeNull();
  });
});

describe('TherapeuticTargets — reorder interactions', () => {
  test('"Reorder Rows" appears in the therapeutic table menu when canEdit is true', async () => {
    renderTherapeutic(true);
    const container = await tableContainerFor('Potential Therapeutic Targets');
    openMenu(container);

    const menu = await screen.findByRole('menu');
    expect(within(menu).getByText('Reorder Rows')).toBeInTheDocument();
  });

  test('"Reorder Rows" appears in the chemoresistance table menu when canEdit is true', async () => {
    renderTherapeutic(true);
    const container = await tableContainerFor('Potential Resistance and Toxicity');
    openMenu(container);

    const menu = await screen.findByRole('menu');
    expect(within(menu).getByText('Reorder Rows')).toBeInTheDocument();
  });

  test('"Reorder Rows" is absent from menus when canEdit is false', async () => {
    renderTherapeutic(false);
    const container = await tableContainerFor('Potential Therapeutic Targets');
    openMenu(container);

    const menu = await screen.findByRole('menu');
    // Menu still has Toggle Columns / Export, just not the reorder entry.
    expect(within(menu).queryByText('Reorder Rows')).toBeNull();
    expect(within(menu).queryByText('Stop Reordering')).toBeNull();
  });

  test('Clicking "Reorder Rows" flips the label to "Stop Reordering"', async () => {
    renderTherapeutic(true);
    const container = await tableContainerFor('Potential Therapeutic Targets');

    openMenu(container);
    await clickMenuItem('Reorder Rows');

    openMenu(container);
    const menu = await screen.findByRole('menu');
    expect(within(menu).getByText('Stop Reordering')).toBeInTheDocument();
    expect(within(menu).queryByText('Reorder Rows')).toBeNull();
  });

  test('Clicking "Stop Reordering" returns the label to "Reorder Rows"', async () => {
    renderTherapeutic(true);
    const container = await tableContainerFor('Potential Therapeutic Targets');

    openMenu(container);
    await clickMenuItem('Reorder Rows');
    openMenu(container);
    await clickMenuItem('Stop Reordering');

    openMenu(container);
    const menu = await screen.findByRole('menu');
    expect(within(menu).getByText('Reorder Rows')).toBeInTheDocument();
  });

  test('Entering reorder on the chemoresistance table cancels reorder on the therapeutic table', async () => {
    renderTherapeutic(true);
    const therapeuticContainer = await tableContainerFor('Potential Therapeutic Targets');
    const chemoContainer = await tableContainerFor('Potential Resistance and Toxicity');

    // Therapeutic enters reorder
    openMenu(therapeuticContainer);
    await clickMenuItem('Reorder Rows');

    // Chemoresistance enters reorder
    openMenu(chemoContainer);
    await clickMenuItem('Reorder Rows');

    // Therapeutic should be back to "Reorder Rows" label
    openMenu(therapeuticContainer);
    const therapeuticMenu = await screen.findByRole('menu');
    expect(within(therapeuticMenu).getByText('Reorder Rows')).toBeInTheDocument();
    expect(within(therapeuticMenu).queryByText('Stop Reordering')).toBeNull();
    await closeOpenMenu();

    // And chemoresistance is still in reorder mode
    openMenu(chemoContainer);
    const chemoMenu = await screen.findByRole('menu');
    expect(within(chemoMenu).getByText('Stop Reordering')).toBeInTheDocument();
  });

  test('Activating reorder shows the drag column in the therapeutic table', async () => {
    renderTherapeutic(true);
    const container = await tableContainerFor('Potential Therapeutic Targets');

    // Drag column starts hidden — no header for it inside this table container.
    await screen.findByText('TP53');
    expect(container.querySelector('.ag-header-cell[col-id="drag"]')).toBeNull();

    openMenu(container);
    await clickMenuItem('Reorder Rows');

    // After enabling reorder, the drag column header should be present.
    await waitFor(() => {
      expect(container.querySelector('.ag-header-cell[col-id="drag"]')).not.toBeNull();
    });
  });

  // Regression: when the user has the table sorted by some other column
  // and then activates reorder, the rank-sort must be re-applied via
  // applyColumnState AFTER React has rebuilt the columnDefs. If the sort
  // call gets reverted by the columnDefs rebuild, rows won't snap back.
  // We verify the production code routes through applyColumnState with the
  // rank-asc state every time reorder activates — independent of ag-grid's
  // internal sort behavior, which is not testable from jsdom.
  test('Activating reorder calls applyColumnState with rank ascending (regression)', async () => {
    const spy = jest.spyOn(ColumnApi.prototype, 'applyColumnState');

    try {
      renderTherapeutic(true);
      const container = await tableContainerFor('Potential Therapeutic Targets');
      await screen.findByText('TP53');

      spy.mockClear();

      openMenu(container);
      await clickMenuItem('Reorder Rows');

      await waitFor(() => {
        const rankCall = spy.mock.calls.find(([arg]) => (
          Array.isArray(arg?.state)
          && arg.state.some((s: { colId?: string; sort?: string }) => s.colId === 'rank' && s.sort === 'asc')
          && arg.defaultState?.sort === null
        ));
        expect(rankCall).toBeDefined();
      });
    } finally {
      spy.mockRestore();
    }
  });
});
