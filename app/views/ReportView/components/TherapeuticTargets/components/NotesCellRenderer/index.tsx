import React from 'react';
import { ICellRendererParams } from '@ag-grid-community/core';

const NotesCellRenderer = ({ value }: ICellRendererParams) => {
  if (!value) return null;

  const lines = (value as string).trim().split('\n');
  return (
    <div style={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}>
      {lines.map((line, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <React.Fragment key={index}>
          {line}
          {index < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default NotesCellRenderer;
