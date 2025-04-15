import { Handler } from 'pagedjs';
/**
 * Handles when a RowSpanned column is split between two pages in print
 * It copies over values from original table to empty cells that are supposed to have values in it
 */
class SplitRowSpanHandler extends Handler {
  // eslint-disable-next-line class-methods-use-this
  afterRendered(pages) {
    const rowSpanMap = {};
    pages.forEach((page) => {
      const originTables = page.element.querySelectorAll('table[data-split-to]');
      originTables.forEach((t) => {
        const rowSpanTds = [...t.querySelectorAll('td[rowspan]')].filter((td) => td.rowSpan > 1);

        rowSpanTds
          .filter((td) => td.innerHTML.trim())
          .forEach((td) => {
            const refId = td.getAttribute('data-ref');
            if (!rowSpanMap[refId]) {
              rowSpanMap[refId] = td.innerHTML;
            }
          });
      });

      const splitTables = page.element.querySelectorAll('table[data-split-from]');
      splitTables.forEach((t) => {
        const rowSpanTds = [...t.querySelectorAll('td[rowspan]')];
        rowSpanTds
          .filter((td) => !td.innerHTML.trim())
          .forEach((td) => {
            const refId = td.getAttribute('data-ref');
            const temp = document.createElement('td');
            temp.innerHTML = rowSpanMap[refId] ?? '';
            td.innerHTML = '';
            td.appendChild(temp.cloneNode(true));
          });
      });
    });
  }
}

export default SplitRowSpanHandler;
