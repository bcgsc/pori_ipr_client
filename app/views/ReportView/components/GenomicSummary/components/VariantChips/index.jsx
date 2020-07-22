import React from 'react';
import PropTypes from 'prop-types';
import { Chip } from '@material-ui/core';

import './index.scss';

const VariantChips = (props) => {
  const {
    variants,
    canEdit,
  } = props;

  return (
    <div>
      {Boolean(variants.length) && (
        <>
          {variants.map(variant => (
            <Chip
              label={variant.geneVariant}
              key={variant.geneVariant}
              className={`variant variant--${variant.type}`}
            />
          ))}
        </>
      )}
    </div>
  );
};

VariantChips.propTypes = {
  variants: PropTypes.arrayOf(PropTypes.object),
  canEdit: PropTypes.bool,
};

VariantChips.defaultProps = {
  variants: [],
  canEdit: false,
};

export default VariantChips;
