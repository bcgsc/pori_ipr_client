import React from 'react';
import { render, screen } from '@testing-library/react';

import PrintTable from '@/components/PrintTable';
import {
  getGenomicEvent,
  sortRapidVariants,
  therapeuticAssociationColDefs,
  therapeuticAssociationPrintColDefs,
  COLLAPSEABLE_COLS,
} from '../columnDefs';
import { MOCK_RAPID_VARIANTS, EXPECTED_GENOMIC_EVENT_ORDER } from '../RapidVariantOrdering.fixtures';

// pagedjs only matters during real paged rendering; stub it out for jsdom.
jest.mock('pagedjs', () => ({
  registerHandlers: jest.fn(),
  Handler: class {},
}));

// Mirrors the SortedByAlterationType Storybook story: same fixtures, same sort,
// same print table + column defs. The story shows it; this test asserts it.
const sorted = sortRapidVariants(MOCK_RAPID_VARIANTS, therapeuticAssociationColDefs);

describe('Rapid summary variant ordering (DEVSU-2995)', () => {
  test('sortRapidVariants yields the expected genomic-event order', () => {
    const labels = sorted.map((row) => getGenomicEvent({ data: row }));
    expect(labels).toEqual(EXPECTED_GENOMIC_EVENT_ORDER);
  });

  test('renders the print table rows in the expected alteration order', () => {
    render(
      <PrintTable
        data={sorted}
        columnDefs={therapeuticAssociationPrintColDefs}
        collapseableCols={COLLAPSEABLE_COLS}
        fullWidth
      />,
    );

    const expected = new Set(EXPECTED_GENOMIC_EVENT_ORDER);
    // getAllByText returns matches in DOM order; restrict to genomic-event cells.
    const renderedOrder = screen
      .getAllByText(
        (_content, element) => element?.tagName === 'TD'
          && expected.has(element.textContent?.trim() ?? ''),
      )
      .map((element) => element.textContent?.trim());

    expect(renderedOrder).toEqual(EXPECTED_GENOMIC_EVENT_ORDER);
  });
});
