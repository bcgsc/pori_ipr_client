import React, { useState, useEffect } from 'react';

import NewTabLink from '@/components/NewTabLink';
import { ICellRendererParams } from '@ag-grid-community/core';

type CivicCellRendererProps = ICellRendererParams;

const CivicCellRenderer = ({
  data,
}: CivicCellRendererProps): JSX.Element => {
  const [link, setLink] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    if (data?.externalSource?.toLowerCase() === 'civic'
      && typeof data?.externalStatementId === 'number') {
        setLink(`https://civicdb.org/links/evidence/${data.externalStatementId}`);
        setText(data.externalSource);
    } else {
      setText(data.externalSource);
    }
  }, [data]);

  if (link) {
    return (
      <NewTabLink link={link} text={text} />
    );
  } else {
    return (
      <div>{text}</div>
    )
  }
}

export default CivicCellRenderer;
