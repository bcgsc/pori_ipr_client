// eslint-disable-next-line import/no-extraneous-dependencies
import '@ag-grid-community/styles/ag-grid.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import '@ag-grid-community/styles/ag-theme-material.css';
import React from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

import NotesCellRenderer from '.';

export default {
  title: 'renderers/NotesCellRenderer',
  component: NotesCellRenderer,
};

const LONG_WORD = 'Thisisaverylongwordthatwillnotfitinanarrowcolumnwithoutbreaking';

export const Default = (): JSX.Element => (
  <div className="ag-theme-material">
    <AgGridReact
      columnDefs={[
        {
          headerName: 'Notes',
          field: 'notes',
          cellRenderer: NotesCellRenderer,
          autoHeight: true,
          suppressAutoSize: true,
          initialWidth: 300,
        },
      ]}
      rowData={[
        { notes: 'Single line note' },
        { notes: 'First line\nSecond line\nThird line' },
        { notes: null },
        { notes: 'Trailing newline trimmed\n' },
        { notes: `Wrapping long word: ${LONG_WORD}` },
      ]}
      defaultColDef={{ resizable: true }}
      suppressAnimationFrame
      suppressColumnVirtualisation
      modules={[ClientSideRowModelModule]}
      domLayout="autoHeight"
    />
  </div>
);
