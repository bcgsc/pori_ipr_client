import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  TextField,
} from '@material-ui/core';
import AutocompleteHandler from '../AutocompleteHandler';

/**
 * 
 */
function EditDialog(props) {
  const {
    editData,
    open,
    close,
  } = props;

  const dialogTitle = Object.keys(editData).length > 0 ? 'Edit Row' : 'Add Row';
  
  const [variant, setVariant] = useState('');
  const [newData, setNewData] = useState({
    variant: editData.variant,
    context: editData.context,
    therapy: editData.therapy,
    evidence: editData.evidence,
    notes: editData.notes,
  });
  const [requiredFields, setRequiredFields] = useState(['variant', 'context', 'therapy']);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (editData.gene && editData.variant) {
      setVariant(`${editData.gene} ${editData.variant}`);
    }
  }, [open]);

  useEffect(() => {

  }, [editData]);

  const onSubmit = (event) => {
    event.preventDefault();


  };

  const onAutocompleteValueSelected = (selectedValue, label) => {
    setNewData({
      [label]: selectedValue,
    });
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <form
          noValidate
          onSubmit={onSubmit}
        >
          <div className="edit__row">
            <FormControl fullWidth>
              <AutocompleteHandler
                defaultValue={variant}
                type="variant"
                label="Gene and Variant"
                onChange={onAutocompleteValueSelected}
                required
              />
            </FormControl>
            <FormControl fullWidth>
              <AutocompleteHandler
                defaultValue={editData.therapy}
                type="therapy"
                label="Therapy"
                onChange={onAutocompleteValueSelected}
                required
              />
            </FormControl>
            <FormControl fullWidth>
              <AutocompleteHandler
                defaultValue={editData.context}
                type="context"
                label="Context"
                onChange={onAutocompleteValueSelected}
                required
              />
            </FormControl>
            <FormControl fullWidth>
              <AutocompleteHandler
                defaultValue={editData.evidenceLevel}
                type="evidence"
                label="Evidence Level"
                onChange={onAutocompleteValueSelected}
              />
            </FormControl>
            <FormControl fullWidth>
              <TextField
                label="Notes"
                variant="outlined"
                margin="normal"
                value={editData.notes || undefined}
                multiline
              />
            </FormControl>
          </div>
        </form>
        <DialogActions>
          <Button color="primary" onClick={close}>
            Cancel
          </Button>
          <Button color="primary" type="submit" onClick={() => close(editData)}>
            Save
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

EditDialog.propTypes = {
  editData: PropTypes.objectOf(PropTypes.any),
  open: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
};

EditDialog.defaultProps = {
  editData: {},
};

export default EditDialog;
