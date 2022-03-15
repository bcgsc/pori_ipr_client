import React from 'react';

import { ICellRendererParams } from '@ag-grid-community/core';

type AppendixCellRendererProps = {
  data
} & Partial<ICellRendererParams>;

const AppendixCellRenderer = ({
  data,
}: AppendixCellRendererProps): JSX.Element => (<div dangerouslySetInnerHTML={{ __html: data.appendix?.text }} />);

export default AppendixCellRenderer;
