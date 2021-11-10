import React, { useState, useEffect } from 'react';

import NewTabLink from '@/components/NewTabLink';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ICellRendererParams } from '@ag-grid-community/core';

type EnsemblCellRendererProps = ICellRendererParams;

const EnsemblCellRenderer = ({
  value,
}: EnsemblCellRendererProps): JSX.Element => {
  const [link, setLink] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    if (value) {
      const match = value.match(/\w*(?=\))/);
      if (match) {
        setLink(`http://ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=${match}`);
        setText(match);
      } else {
        setLink(`http://ensembl.org/Homo_sapiens/Gene/Summary?db=core;t=${value}`);
        setText(value);
      }
    }
  }, [value]);

  return (
    <NewTabLink link={link} text={text} />
  );
};

export default EnsemblCellRenderer;
