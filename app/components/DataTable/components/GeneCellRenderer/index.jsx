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
    context: { reportIdent },
  } = params;

  const [showGeneViewer, setShowGeneViewer] = useState(false);

  return (
    <>
      {value.split(', ').map((val, index) => (
        <>
          {index > 0 && (
            <span>
              {' :: '}
            </span>
          )}
          <span
            tabIndex={0}
            role="button"
            onClick={() => setShowGeneViewer(prevVal => !prevVal)}
            onKeyDown={() => setShowGeneViewer(prevVal => !prevVal)}
            className="gene__text"
          >
            {val}
          </span>
          <>
            {showGeneViewer && (
              <GeneViewer
                open={showGeneViewer}
                gene={val}
                reportIdent={reportIdent}
                onClose={() => setShowGeneViewer(false)}
              />
            )}
          </>
        </>
      ))}
    </>
  );
}

export default GeneCellRenderer;
