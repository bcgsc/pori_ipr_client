import React from 'react';

import GeneViewer from '../GeneViewer';

import './index.scss';

type GeneCellRendererProps = {
  value: string;
  link?: boolean;
};

const GeneCellRenderer = ({
  value,
  link = false,
}: GeneCellRendererProps) => {
  if (!value) {
    return null;
  }
  return (
    value && value.split(/\s*::\s*|,\s?/).map((val, index) => (
    // eslint-disable-next-line react/no-array-index-key
      <React.Fragment key={`${val}_${index}`}>
        {index > 0 && (
        <span>
          {value.includes(' :: ') ? ' :: ' : ', '}
        </span>
        )}
        <GeneViewer
          isLink={link}
          gene={val}
        />
      </React.Fragment>
    ))
  );
};

export default GeneCellRenderer;
