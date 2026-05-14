import React from 'react';
import {
  render, screen, fireEvent, waitFor, within, cleanup,
} from '@testing-library/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ColumnApi, ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { when, resetAllWhenMocks } from 'jest-when';

import ReportContext from '@/context/ReportContext';
import api, { ApiCall } from '@/services/api';
import { ReportType } from '@/common';
import Therapeutic from '..';

jest.mock('@/services/api');
jest.mock('@/services/SnackbarUtils');

const mockReport = { ident: 'report-1' } as ReportType;

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

const renderTherapeutic = (canEdit: boolean) => render(
  <ReportContext.Provider
    value={{
      canEdit,
      report: mockReport,
      reportTemplateName: '',
      refetchReport: () => null,
    }}
  >
    <Therapeutic />
  </ReportContext.Provider>,
);

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

describe('TherapeuticTargets — reorder interactions', () => {
  beforeAll(() => {
    ModuleRegistry.registerModules([ClientSideRowModelModule, CsvExportModule]);
  });

  beforeEach(() => {
    resetAllWhenMocks();
    when(api.get as (...args: unknown[]) => Partial<ApiCall>)
      .mockImplementation(() => ({ request: async () => mockTherapeuticTargets }));
  });

  afterEach(() => {
    cleanup();
  });

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
