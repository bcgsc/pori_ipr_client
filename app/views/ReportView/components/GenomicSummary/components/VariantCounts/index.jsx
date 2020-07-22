import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';

import './index.scss';

const nameMapping = {
  cnv: 'Copy Number Variants',
  smallMutation: 'Small Mutations',
  structuralVariant: 'Structural Variants',
  expression: 'Expression Outliers',
};

const VariantCounts = (props) => {
  const {
    counts,
  } = props;

  return (
    <div className="variant-counts">
      {counts && (
        <>
          {Object.entries(counts).map(([key, count]) => (
            <span key={key} className={`variant-counts__group variant-counts__group--${key}`}>
              <Typography display="inline" className="variant-counts__key">
                {nameMapping[key] || key}
              </Typography>
              <Typography display="inline" className="variant-counts__count">
                {count}
              </Typography>
            </span>
          ))}
        </>
      )}
    </div>
  );
};

VariantCounts.propTypes = {
  counts: PropTypes.objectOf(PropTypes.number).isRequired,
};

export default VariantCounts;
