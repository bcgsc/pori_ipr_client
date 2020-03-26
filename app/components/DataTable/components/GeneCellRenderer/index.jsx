import React, { useState } from 'react';
import GeneViewer from '../GeneViewer';

/**
 * @param {object} params params
 * @param {string} params.value display text
 * @param {string} props.link target link
 * @return {*} JSX
 */
function GeneCellRenderer(params) {
  const {
    value,
  } = params;

  const [showGeneViewer, setShowGeneViewer] = useState(false);

  return (
    <>
      <a onClick={setShowGeneViewer}>
        {value}
      </a>
      <GeneViewer
        open={showGeneViewer}
      />
    </>
  );
}

export default GeneCellRenderer;
