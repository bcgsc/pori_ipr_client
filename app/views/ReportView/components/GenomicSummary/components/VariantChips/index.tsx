import React, { useState, useCallback } from 'react';
import {
  Chip, TextField, InputAdornment, IconButton,
} from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import AddIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';
import AlertDialog from '@/components/AlertDialog';
import { GeneVariantType } from '@/views/ReportView/components/GenomicSummary/types';

import './index.scss';

const ENTER_KEYCODE = 13;

type VariantChipsProps = {
  variants?: GeneVariantType[];
  canEdit?: boolean;
  onChipDeleted?: (ident: string, type: string, comment: string) => void;
  onChipAdded?: (variant: string) => void;
  isPrint?: boolean;
};

const VariantChips = ({
  variants = [],
  canEdit = false,
  onChipDeleted = () => {},
  onChipAdded = () => {},
  isPrint = false,
}: VariantChipsProps): JSX.Element => {
  const [showDeleteAlert, setShowDeleteAlert] = useState<GeneVariantType | false>(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [addedVariant, setAddedVariant] = useState('');

  const handleDeleteDialogClose = useCallback((deleted: boolean, comment: string) => {
    if (deleted && showDeleteAlert) {
      onChipDeleted((showDeleteAlert as GeneVariantType).ident, (showDeleteAlert as GeneVariantType).type, comment);
    }
    setShowDeleteAlert(false);
  }, [showDeleteAlert, onChipDeleted]);

  const handleAddInputClose = useCallback((added: boolean) => {
    if (added) {
      onChipAdded(addedVariant);
    }
    setShowAddInput(false);
    setAddedVariant('');
  }, [onChipAdded, addedVariant]);

  const handleEnterPressed = useCallback((event: React.KeyboardEvent) => {
    if (event.keyCode === ENTER_KEYCODE) {
      handleAddInputClose(true);
    }
  }, [handleAddInputClose]);

  let newGeneAlterationButton = null;
  if (canEdit && !isPrint) {
    if (!showAddInput) {
      newGeneAlterationButton = (
        <Chip
          label="Add new entry"
          className="variant variant__add"
          onDelete={() => setShowAddInput(true)}
          deleteIcon={<AddIcon />}
        />
      );
    } else {
      newGeneAlterationButton = (
        <TextField
          value={addedVariant}
          type="text"
          size="small"
          margin="dense"
          variant="outlined"
          label="Gene name (alteration)"
          onKeyDown={handleEnterPressed}
          onChange={(event) => setAddedVariant(event.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {addedVariant && (
                  <IconButton onClick={() => handleAddInputClose(true)} size="large">
                    <DoneIcon />
                  </IconButton>
                )}
                <IconButton onClick={() => handleAddInputClose(false)} size="large">
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      );
    }
  }

  return (
    <div>
      <div>
        {Boolean(variants.length) && (
          <>
            {variants.map((variant) => (
              <React.Fragment key={variant.geneVariant}>
                <Chip
                  label={`${variant.geneVariant} ${(variant as any).germline ? '(germline)' : ''}`}
                  className={`variant variant--${variant.type}`}
                  onDelete={canEdit && !isPrint ? () => setShowDeleteAlert(variant) : null}
                />
              </React.Fragment>
            ))}
          </>
        )}
      </div>
      {newGeneAlterationButton}
      <AlertDialog
        isOpen={Boolean(showDeleteAlert)}
        onClose={handleDeleteDialogClose}
        title="Remove Alteration"
        text={`Are you sure you want to delete ${(showDeleteAlert as GeneVariantType)?.geneVariant}?`}
        confirmText="Delete"
        cancelText="Cancel"
        commentRequired
      />
    </div>
  );
};

export default VariantChips;
