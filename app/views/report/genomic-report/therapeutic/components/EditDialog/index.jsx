import React, { useState } from 'react';
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
    toggleOpen,
    stopEditing,
  } = props;

  const dialogTitle = Object.keys(editData).length > 0 ? 'Edit Row' : 'Add Row';

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <form>
          <div className="edit__row">
            <FormControl fullWidth>
              <AutocompleteHandler
                defaultValue={editData.variant}
                type="variant"
                label="Gene and Variant"
              />
              <AutocompleteHandler
                defaultValue={editData.therapy}
                type="therapy"
                label="Therapy"
              />
              <AutocompleteHandler
                defaultValue={editData.context}
                type="context"
                label="Context"
              />
              <AutocompleteHandler
                defaultValue={editData.evidence}
                type="evidence"
                label="Evidence Label"
              />
              <TextField
                label="Notes"
                variant="outlined"
                margin="normal"
                multiline
              />
            </FormControl>
          </div>
        </form>
        <DialogActions>
          <Button color="primary" onClick={toggleOpen}>
            Cancel
          </Button>
          <Button color="primary" onClick={toggleOpen}>
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
  toggleOpen: PropTypes.func.isRequired,
  stopEditing: PropTypes.func,
};

EditDialog.defaultProps = {
  editData: {},
  stopEditing: () => {},
};

export default EditDialog;
