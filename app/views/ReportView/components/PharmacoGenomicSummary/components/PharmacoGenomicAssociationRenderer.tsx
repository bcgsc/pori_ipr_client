import React from 'react';
import { ICellRendererParams } from '@ag-grid-community/core';

const PharmacoGenomicAssociationRenderer = ({ data }: ICellRendererParams) => {
  const fieldData = data.kbMatchedStatements?.map(({ relevance }) => relevance) || [];

  if (Array.isArray(fieldData) && fieldData.length > 0) {
    const cellData = [...fieldData].sort();
    const [firstVal] = cellData;

    return (
      <div>
        {`${firstVal === null ? '' : firstVal}`}
        {cellData.length > 1 && <>…</>}
      </div>
    );
  }

  return <div>{`${fieldData.length === 0 ? '' : fieldData}`}</div>;
};

export default PharmacoGenomicAssociationRenderer;
