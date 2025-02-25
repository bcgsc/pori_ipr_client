import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ICellRendererParams } from '@ag-grid-community/core';

import './index.scss';

const urlRegex = /^(?:https?:\/\/)?(?:[\w-]+\.)+[a-z]{2,}(?:\/[\w\-\.\/]*)*$/i;
const NCBI_API_LINK = 'https://pubmed.ncbi.nlm.nih.gov';

const RenderArrayCell = (field: string, isLink: boolean): (cellParams: ICellRendererParams) => JSX.Element => {
  if (isLink) {
    return function ArrayCell({ data }: ICellRendererParams) {
      if (Array.isArray(data[field])) {
        const cellData = [...data[field]].sort();

        const firstVal = cellData[0]?.replace(/(pmid:)|(#)/, '');

        let link = firstVal;
        let validLink = false;

        // firstVal might be non-link
        if (firstVal.match(/^\d+$/)) {
          link = `${NCBI_API_LINK}/${firstVal}`;
          validLink = true;
        } else if (urlRegex.test(firstVal)) {
          validLink = true;
        }

        let linkComponent = firstVal;

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
export {
  RenderArrayCell,
  NCBI_API_LINK,
};
