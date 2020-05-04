import React from 'react';
import './index.scss';

const RenderArrayCell = (field, isLink) => {
  if (isLink) {
    return function ArrayCell(cellParams) {
      if (Array.isArray(cellParams.data[field])) {
        const cellData = cellParams.data[field].sort();
        const firstVal = cellData[0].replace(/(pmid:)|(#)/, '');

        return (
          <div>
            <a
              className="array-cell__link"
              href={(firstVal.match(/^\d+$/))
                ? `https://ncbi.nlm.nih.gov/pubmed/${firstVal}`
                : `http://${firstVal}`
              }
              rel="noopener noreferrer"
              target="_blank"
            >
              {firstVal}
            </a>
            {cellData.length > 1 && (
              <>
                …
              </>
            )}
          </div>
        );
      }
      return (
        <div>
          {cellParams.data[field]}
        </div>
      );
    };
  }

  return function ArrayCell(cellParams) {
    if (Array.isArray(cellParams.data[field])) {
      const cellData = cellParams.data[field].sort();
      const firstVal = cellData[0] && cellData[0].replace(/#$/, '');

      return (
        <div>
          {firstVal}
          {cellData.length > 1 && (
            <>
              …
            </>
          )}
        </div>
      );
    }
    return (
      <div>
        {cellParams.data[field]}
      </div>
    );
  };
};

export default RenderArrayCell;
