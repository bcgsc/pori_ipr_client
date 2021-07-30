import React, { useState, useEffect } from 'react';

import NewTabLink from '@/components/NewTabLink';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ICellRendererParams } from '@ag-grid-community/core';

type CivicCellRendererProps = ICellRendererParams['data'];

const CivicCellRenderer = ({
  data,
}: CivicCellRendererProps): JSX.Element => {
  const [link, setLink] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    if (data?.externalSource?.toLowerCase() === 'civic'
      && !Number.isNaN(parseInt(data.externalStatementId, 10))) {
      setLink(`https://civicdb.org/links/evidence/${parseInt(data.externalStatementId, 10)}`);
      setText(data.externalSource);
    } else {
      setText(data.externalSource);
    }
  }, [data]);

  if (link) {
    return (
      <NewTabLink link={link} text={text} />
    );
  }
  return (
    <div>{text}</div>
  );
};

export default CivicCellRenderer;
