import React, { useEffect, useRef } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ICellRendererParams } from '@ag-grid-community/core';

import './index.scss';

const urlRegex = /^(?:https?:\/\/)?(?:[\w-]+\.)+[a-z]{2,}(?:\/[\w\-\.\/]*)*$/i;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getNestedValue = (obj: ICellRendererParams['data'], path: string): any[] => path.split('.').reduce((acc, key) => {
  if (Array.isArray(acc)) {
    return acc.flatMap((item) => (item && item[key] !== undefined ? item[key] : []));
  }
  return acc && acc[key] !== undefined ? acc[key] : [];
}, obj);

type ArrayCellOptions = {
  /** Render cell values as hyperlinks where possible */
  isLink?: boolean;
  /** Read value from ag-Grid valueGetter output instead of data field */
  useValue?: boolean;
  /** Render all link-able items as links (links first, plain text after), instead of only the first */
  allLinks?: boolean;
};

type LinkItem = { text: string; href: string | null };

const getItemLink = (raw: string): LinkItem => {
  const text = raw?.replace(/(pmid:)|(#)/, '');
  if (!text) return { text: raw, href: null };
  if (text.match(/^\d+$/)) return { text, href: `https://ncbi.nlm.nih.gov/pubmed/${text}` };
  if (text.match(/^NCT\d+$/)) return { text, href: `https://clinicaltrials.gov/study/${text}` };
  if (urlRegex.test(text)) return { text, href: text };
  return { text, href: null };
};

type AllLinksCellProps = {
  ordered: LinkItem[];
  node: ICellRendererParams['node'];
  api: ICellRendererParams['api'];
};

const AllLinksCell = ({ ordered, node, api }: AllLinksCellProps) => {
  const cellWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (!cellWrapperRef.current) return;
      const myHeight = cellWrapperRef.current.scrollHeight;
      if (!myHeight) return;

      // Find the row in the DOM and measure all cells to respect other autoHeight columns (e.g. Context)
      const rowEl = cellWrapperRef.current.closest('[role="row"]') as HTMLElement;
      const cellHeights = rowEl
        ? Array.from(rowEl.querySelectorAll('[role="gridcell"]')).map((cell) => (cell as HTMLElement).scrollHeight)
        : [];
      const height = Math.max(myHeight, ...cellHeights);

      node.setRowHeight(height);
      api.onRowHeightChanged();
    };

    // Defer initial measurement until after the browser has laid out the cell
    const rafId = requestAnimationFrame(updateHeight);

    // Run after DataTable's resetRowHeights() has fired so we win the race
    const onColumnResized = (event: { finished: boolean }) => {
      if (event.finished) setTimeout(updateHeight, 0);
    };

    api.addEventListener('columnResized', onColumnResized);
    return () => {
      cancelAnimationFrame(rafId);
      api.removeEventListener('columnResized', onColumnResized);
    };
  }, [api, node]);

  return (
    <div ref={cellWrapperRef} className="array-cell__wrap">
      {ordered.map((item, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={`${item.text}-${index}`}>
          {item.href ? (
            <a
              className="array-cell__link"
              href={item.href}
              rel="noopener noreferrer"
              target="_blank"
            >
              {item.text}
            </a>
          ) : (
            item.text
          )}
          {index < ordered.length - 1 && ', '}
        </span>
      ))}
    </div>
  );
};

const RenderArrayCell = (
  fieldPath: string,
  options: ArrayCellOptions = {},
): (cellParams: Partial<ICellRendererParams>) => JSX.Element => {
  const { isLink = false, useValue = false, allLinks = false } = options;

  if (isLink) {
    return function ArrayCell(params: ICellRendererParams) {
      const { data, value } = params;
      const fieldData = useValue ? value : getNestedValue(data, fieldPath);
      const cellData = (Array.isArray(fieldData) ? [...fieldData] : [fieldData])
        .filter((v) => v !== null && v !== '')
        .sort();

      if (allLinks) {
        const { node, api } = params;
        const items = cellData.map(getItemLink);
        const links = items.filter((i) => i.href);
        const nonLinks = items.filter((i) => !i.href);
        return <AllLinksCell ordered={[...links, ...nonLinks]} node={node} api={api} />;
      }

      const firstVal = cellData[0]?.replace(/(pmid:)|(#)/, '');

      let link = firstVal;
      let validLink = false;

      if (firstVal?.match(/^\d+$/)) {
        link = `https://ncbi.nlm.nih.gov/pubmed/${firstVal}`;
        validLink = true;
      } else if (firstVal?.match(/^NCT\d+$/)) {
        link = `https://clinicaltrials.gov/study/${firstVal}`;
        validLink = true;
      } else if (urlRegex.test(firstVal)) {
        validLink = true;
      }

      let linkComponent = firstVal || '';

      if (validLink) {
        linkComponent = (
          <a
            className="array-cell__link"
            href={link}
            rel="noopener noreferrer"
            target="_blank"
          >
            {firstVal}
          </a>
        );
      }

      return (
        <div>
          {linkComponent}
          {cellData.length > 1 && <>…</>}
        </div>
      );
    };
  }

  return function ArrayCell({ data }: Partial<ICellRendererParams>) {
    const fieldData = getNestedValue(data, fieldPath);

    // Ensure fieldData is always treated as an array
    const cellData = (Array.isArray(fieldData) ? [...fieldData] : [fieldData])
      .filter((v) => v !== null && v !== '')
      .sort();
    const [firstVal] = cellData;
    // AgGrid doesn't like false to show in table
    const firstValString = `${firstVal}`;

    return (
      <div>
        {(firstVal !== null && firstVal !== undefined) ? firstValString : null}
        {cellData.length > 1 && <>…</>}
      </div>
    );
  };
};

export {
  getNestedValue,
  RenderArrayCell,
};

export default RenderArrayCell;
