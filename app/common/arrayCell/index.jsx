import React from 'react';

const renderArrayCell = (field, isLink) => {
  if (isLink) {
    return (cellParams) => {
      const cellData = [...cellParams.data[field]].sort();
      const firstVal = cellData[0].replace('#', '');

      return (
        <div>
          <a
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
    };
  }

  return (cellParams) => {
    const cellData = [...cellParams.data[field]].sort();
    const firstVal = cellData[0].replace('#', '');

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
  };
};

export default renderArrayCell;
