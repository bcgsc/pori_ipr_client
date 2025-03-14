import React from 'react';
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

const RenderArrayCell = (fieldPath: string, isLink: boolean = false): (cellParams: Partial<ICellRendererParams>) => JSX.Element => {
  if (isLink) {
    return function ArrayCell({ data }: ICellRendererParams) {
      const fieldData = getNestedValue(data, fieldPath) || [];
      const cellData = Array.isArray(fieldData) ? [...fieldData].sort() : [fieldData];

      const firstVal = cellData[0]?.replace(/(pmid:)|(#)/, '');

      let link = firstVal;
      let validLink = false;

      if (firstVal.match(/^\d+$/)) {
        link = `https://ncbi.nlm.nih.gov/pubmed/${firstVal}`;
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
          {cellData.length > 1 && <>…</>}
        </div>
      );
    };
  }

  return function ArrayCell({ data }: Partial<ICellRendererParams>) {
    const fieldData = getNestedValue(data, fieldPath);

    // Ensure fieldData is always treated as an array
    const cellData = Array.isArray(fieldData) ? [...fieldData].sort() : [fieldData];
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
