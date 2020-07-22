import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';
import FilterListIcon from '@material-ui/icons/FilterList';

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
    filter,
    onToggleFilter,
  } = props;

  const filterCallback = useCallback((key) => {
    if (!filter || (filter && filter !== key)) {
      onToggleFilter(key);
    } else {
      onToggleFilter(null);
    }
  }, [filter, onToggleFilter]);

  return (
    <div className="variant-counts">
      {counts && (
        <>
          {Object.entries(counts).map(([key, count], index) => (
            <span
              key={key}
              tabIndex={index}
              className={`variant-counts__group variant-counts__group--${key} ${filter ? 'variant-counts__group--active' : ''}`}
              onClick={() => filterCallback(key)}
              onKeyUp={() => filterCallback(key)}
              role="button"
            >
              <span className="variant-counts__key">
                <Typography display="inline">
                  {nameMapping[key] || key}
                </Typography>
                {filter === key && (
                  <FilterListIcon className="variant-counts__icon" />
                )}
              </span>
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
  filter: PropTypes.string,
  onToggleFilter: PropTypes.func,
};

VariantCounts.defaultProps = {
  filter: '',
  onToggleFilter: () => {},
};

export default VariantCounts;
