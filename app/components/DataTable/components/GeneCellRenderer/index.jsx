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
      {value && value.split(/\s::\s|,\s/).map((val, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span>
              {value.includes(' :: ') ? ' :: ' : ', '}
            </span>
          )}
          <span
            tabIndex={0}
            role="button"
            onClick={() => setShowGeneViewer(val)}
            onKeyDown={() => setShowGeneViewer(val)}
            className="gene__text"
          >
            {val}
          </span>
          <>
            {showGeneViewer && (
              <GeneViewer
                open={showGeneViewer === val}
                gene={val}
                reportIdent={reportIdent}
                onClose={() => setShowGeneViewer(false)}
              />
            )}
          </>
        </React.Fragment>
      ))}
    </>
  );
}

export default GeneCellRenderer;
