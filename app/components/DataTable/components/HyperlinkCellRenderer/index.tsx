import { ICellRendererParams } from '@ag-grid-community/core';
import React from 'react';

const HyperlinkCellRenderer = ({ value }: ICellRendererParams): JSX.Element => (
  <a href={`/reports/patients/${value}`}>{value}</a>
);

export default HyperlinkCellRenderer;
