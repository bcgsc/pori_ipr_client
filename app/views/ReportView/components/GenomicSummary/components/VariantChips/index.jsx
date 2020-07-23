import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Chip } from '@material-ui/core';
import AlertDialog from '@/components/AlertDialog';

import './index.scss';

const VariantChips = (props) => {
  const {
    variants,
    canEdit,
    handleChipDeleted,
  } = props;

  const [showAlert, setShowAlert] = useState(false);

  const handleDialogClose = async (deleted, comment) => {
    if (deleted) {
      handleChipDeleted(showAlert.ident, showAlert.type, comment);
    }
    setShowAlert(false);
  };

  return (
    <div>
      {Boolean(variants.length) && (
        <>
          {variants.map(variant => (
            <React.Fragment key={variant.geneVariant}>
              <Chip
                label={variant.geneVariant}
                className={`variant variant--${variant.type}`}
                onDelete={canEdit ? () => setShowAlert(variant) : null}
              />
            </React.Fragment>
          ))}
        </>
      )}
      <AlertDialog
        isOpen={Boolean(showAlert)}
        handleClose={handleDialogClose}
        title="Confirm"
        text={`Are you sure you want to delete ${showAlert.geneVariant}?`}
        confirmText="Delete"
        cancelText="Cancel"
        commentRequired
      />
    </div>
  );
};

VariantChips.propTypes = {
  variants: PropTypes.arrayOf(PropTypes.object),
  canEdit: PropTypes.bool,
  handleChipDeleted: PropTypes.func,
};

VariantChips.defaultProps = {
  variants: [],
  canEdit: false,
  handleChipDeleted: () => {},
};

export default VariantChips;
