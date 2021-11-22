import React, { useState } from 'react';

import GeneViewer from '../GeneViewer';

import './index.scss';

type GeneCellRendererProps = {
  value: string;
  link?: boolean;
};

const GeneCellRenderer = ({
  value,
  link = false,
}: GeneCellRendererProps): JSX.Element => {
  const [showGeneViewer, setShowGeneViewer] = useState(false);

  return (
    <>
      {value && value.split(/\s*::\s*|,\s?/).map((val, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span>
              {value.includes(' :: ') ? ' :: ' : ', '}
            </span>
          )}
          {link ? (
            <>
              <span
                tabIndex={0}
                role="button"
                onClick={() => setShowGeneViewer(true)}
                onKeyDown={() => setShowGeneViewer(true)}
                className="gene__text"
              >
                {val}
              </span>
              <>
                {showGeneViewer && (
                  <GeneViewer
                    isOpen={showGeneViewer}
                    gene={val}
                    onClose={() => setShowGeneViewer(false)}
                  />
                )}
              </>
            </>
          ) : (
            <span>
              {val}
            </span>
          )}
        </React.Fragment>
      ))}
    </>
  );
};

export default GeneCellRenderer;
