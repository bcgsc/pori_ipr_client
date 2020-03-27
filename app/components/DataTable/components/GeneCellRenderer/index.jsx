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
    context: { reportId },
  } = params;

  const [showGeneViewer, setShowGeneViewer] = useState(false);

  return (
    <>
      <span
        tabIndex={0}
        role="button"
        onClick={() => setShowGeneViewer(prevVal => !prevVal)}
        onKeyDown={() => setShowGeneViewer(prevVal => !prevVal)}
        className="gene__text"
      >
        {value}
      </span>
      {showGeneViewer && (
        <GeneViewer
          open={showGeneViewer}
          gene={value}
          reportId={reportId}
        />
      )}
    </>
  );
}

export default GeneCellRenderer;
