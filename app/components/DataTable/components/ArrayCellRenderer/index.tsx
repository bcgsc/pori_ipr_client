import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ICellRendererParams } from '@ag-grid-community/core';

import './index.scss';

const RenderArrayCell = (field: string, isLink: boolean): (cellParams: ICellRendererParams) => JSX.Element => {
  if (isLink) {
    return function ArrayCell({ data }: ICellRendererParams) {
      if (Array.isArray(data[field])) {
        const cellData = [...data[field]].sort();
        if (!/(pmid:)|(#)/.test(cellData[0])) {
          return <span>{cellData.join(', ')}</span>;
        }

        const firstVal = cellData[0].replace(/(pmid:)|(#)/, '');

        return (
          <div>
            <a
              className="array-cell__link"
              href={(firstVal.match(/^\d+$/))
                ? `https://ncbi.nlm.nih.gov/pubmed/${firstVal}`
                : `http://${firstVal}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              {firstVal}
            </a>
            {cellData.length > 1 && (
              <>
                …
              </>
            )}
          </div>
        );
      }
      return (
        <div>
          {data[field]}
        </div>
      );
    };
  }

  return function ArrayCell({ data }: ICellRendererParams) {
    if (Array.isArray(data[field])) {
      const cellData = [...data[field]].sort();
      const [firstVal] = cellData;

      if (typeof firstVal === 'string') {
        cellData[0].replace(/#$/, '');
      }

      return (
        <div>
          {`${firstVal === null ? '' : firstVal}`}
          {cellData.length > 1 && (
            <>
              …
            </>
          )}
        </div>
      );
    }
    return (
      <div>
        {`${data[field] === null ? '' : data[field]}`}
      </div>
    );
  };
};

export default RenderArrayCell;
