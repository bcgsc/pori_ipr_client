import React, { useState } from 'react';
import GeneViewer from '../GeneViewer';

import './index.scss';

/**
 * @param {object} params params
 * @param {string} params.value display text
 * @return {*} JSX
 */
function GeneCellRenderer(params) {
  const {
    value,
  } = params;

  const [showGeneViewer, setShowGeneViewer] = useState(false);

  return (
    <>
      <span
        tabIndex={0}
        role="button"
        onClick={setShowGeneViewer}
        onKeyDown={setShowGeneViewer}
        className="gene__text"
      >
        {value}
      </span>
      <GeneViewer
        open={showGeneViewer}
      />
    </>
  );
}

export default GeneCellRenderer;
