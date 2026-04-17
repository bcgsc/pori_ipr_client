import React, { useCallback } from 'react';
import { Typography } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

import './index.scss';

const nameMapping = {
  cnv: 'Copy Number Variants',
  smallMutation: 'Small Mutations',
  structuralVariant: 'Structural Variants',
  expression: 'Expression Outliers',
};

type VariantCountsProps = {
  counts: Record<string, number>;
  filter?: string;
  onToggleFilter?: (key: string | null) => void;
};

const VariantCounts = ({
  counts,
  filter = '',
  onToggleFilter = () => {},
}: VariantCountsProps): JSX.Element => {
  const filterCallback = useCallback((key: string) => {
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

export default VariantCounts;
