import React, { useState, useEffect } from 'react';

/**
 * @param {object} params params
 * @param {string} params.value display text
 * @param {string} props.link target link
 * @return {*} JSX
 */
function LinkCellRenderer(params) {
  const {
    value,
  } = params;

  const [link, setLink] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    if (value) {
      const match = value.match(/\w*(?=\))/);
      if (match) {
        setLink(`http://ensembl.org/Homo_sapiens/Gene/Summary?db=core;g=${match}`);
        setText(match);
      } else {
        setLink(`http://ensembl.org/Homo_sapiens/Gene/Summary?db=core;t=${value}`);
        setText(value);
      }
    }
  }, [value]);

  return (
    <a href={link} target="_blank" rel="noopener noreferrer">
      {text}
    </a>
  );
}

export default LinkCellRenderer;
