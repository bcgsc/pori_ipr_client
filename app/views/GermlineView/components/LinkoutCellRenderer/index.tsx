import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ICellRendererParams } from '@ag-grid-community/core';

const LINK_KEY_TO_URI = {
  clinvar: 'https://www.ncbi.nlm.nih.gov/clinvar/variation/',
  dbSnp: 'https://www.ncbi.nlm.nih.gov/snp/',
  cosmic: 'https://cancer.sanger.ac.uk/cosmic/search?q=',
};
interface LinkoutCellRendererParams extends ICellRendererParams {
  linkKey: string;
}

const LinkoutCellRenderer = (params: LinkoutCellRendererParams) => {
  const {
    value: id, linkKey,
  } = params;
  if (!linkKey) return null;

  const url = `${LINK_KEY_TO_URI[linkKey]}${id}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">{id}</a>
  );
};

export default LinkoutCellRenderer;
