import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Chip, TextField, InputAdornment, IconButton,
} from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';
import AddIcon from '@material-ui/icons/AddCircle';
import CloseIcon from '@material-ui/icons/Close';
import AlertDialog from '@/components/AlertDialog';

import './index.scss';

const ENTER_KEYCODE = 13;

const VariantChips = (props) => {
  const {
    variants,
    canEdit,
    onChipDeleted,
    onChipAdded,
    isPrint,
  } = props;

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [addedVariant, setAddedVariant] = useState('');

  const handleDeleteDialogClose = useCallback((deleted, comment) => {
    if (deleted) {
      onChipDeleted(showDeleteAlert.ident, showDeleteAlert.type, comment);
    }
    setShowDeleteAlert(false);
  }, [showDeleteAlert, onChipDeleted]);

  const handleAddInputClose = useCallback((added) => {
    if (added) {
      onChipAdded(addedVariant);
    }
    setShowAddInput(false);
    setAddedVariant('');
  }, [onChipAdded, addedVariant]);

  const handleEnterPressed = (event) => {
    if (event.keyCode === ENTER_KEYCODE) {
      handleAddInputClose(true);
    }
  }

  return (
    <div>
      <div>
        {Boolean(variants.length) && (
          <>
            {variants.map(variant => (
              <React.Fragment key={variant.geneVariant}>
                <Chip
                  label={variant.geneVariant}
                  className={`variant variant--${variant.type}`}
                  onDelete={canEdit && !isPrint ? () => setShowDeleteAlert(variant) : null}
                />
              </React.Fragment>
            ))}
          </>
        )}
      </div>
      {canEdit && !isPrint && (
        <>
          {!showAddInput ? (
            <Chip
              label="Add new entry"
              className="variant variant__add"
              onDelete={() => setShowAddInput(true)}
              deleteIcon={<AddIcon />}
            />
          ) : (
            <TextField
              value={addedVariant}
              type="text"
              size="small"
              margin="dense"
              variant="outlined"
              label="Gene name (alteration)"
              onKeyDown={handleEnterPressed}
              onChange={event => setAddedVariant(event.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {addedVariant && (
                      <IconButton onClick={() => handleAddInputClose(true)}>
                        <DoneIcon />
                      </IconButton>
                    )}
                    <IconButton onClick={() => handleAddInputClose(false)}>
                      <CloseIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        </>
      )}
      <AlertDialog
        isOpen={Boolean(showDeleteAlert)}
        onClose={handleDeleteDialogClose}
        title="Remove Alteration"
        text={`Are you sure you want to delete ${showDeleteAlert.geneVariant}?`}
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
  onChipDeleted: PropTypes.func,
  onChipAdded: PropTypes.func,
  isPrint: PropTypes.bool,
};

VariantChips.defaultProps = {
  variants: [],
  canEdit: false,
  onChipDeleted: () => {},
  onChipAdded: () => {},
  isPrint: false,
};

export default VariantChips;
