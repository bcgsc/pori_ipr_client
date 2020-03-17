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
import { therapeuticAdd, therapeuticUpdate } from '../../../../../../services/reports/therapeutic';

/**
 * @param {object} props props
 * @param {object} props.editData data passed to edit
 * @param {bool} props.open is the dialog open
 * @param {func} props.close onClose function
 * @param {string} props.reportIdent ident of current report
 * @param {string} props.tableType therapeutic | chemoresistant
 * @return {*} JSX
 */
function EditDialog(props) {
  const {
    editData,
    open,
    close,
    reportIdent,
    tableType,
  } = props;

  const dialogTitle = Object.keys(editData).length > 0 ? 'Edit Row' : 'Add Row';
  
  const [newData, setNewData] = useState({
    variant: editData.variant,
    context: editData.context,
    therapy: editData.therapy,
    evidence: editData.evidence,
    notes: editData.notes,
  });
  const [requiredFields] = useState(['variant', 'context', 'therapy']);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (editData) {
      setNewData({
        variant: editData.variant,
        context: editData.context,
        therapy: editData.therapy,
        evidence: editData.evidence,
        notes: editData.notes,
      });
    }
  }, [editData]);

  const isMissingFields = (combinedData) => {
    const missing = requiredFields.filter(field => !combinedData[field]);

    if (missing.length) {
      setErrors(missing.reduce((acc, curr) => {
        acc[curr] = `${curr} is required`;
        return acc;
      }, {}));
      return true;
    }
    return false;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    let combinedData;

    if (Object.keys(editData).length) {
      combinedData = {
        ...editData,
        ...newData,
      };

      if (isMissingFields(combinedData)) {
        return;
      }

      await therapeuticUpdate(
        reportIdent,
        editData.ident,
        combinedData,
      );

      close(combinedData);
    } else {
      combinedData = { type: tableType, ...newData };

      if (isMissingFields(combinedData)) {
        return;
      }

      await therapeuticAdd(
        reportIdent,
        combinedData,
      );
    }
    close(combinedData);
  };

  const onAutocompleteValueSelected = (selectedValue, label) => {
    if (selectedValue) {
      setNewData({
        ...newData,
        [label]: selectedValue.displayName,
      });
    }
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <form
          noValidate
          onSubmit={onSubmit}
        >
          {/* <FormControl fullWidth>
            <AutocompleteHandler
              defaultValue={editData.gene}
              type="gene"
              label="Gene"
              onChange={onAutocompleteValueSelected}
              required
              error={errors.gene}
            />
          </FormControl> */}
          <FormControl fullWidth>
            <AutocompleteHandler
              defaultValue={editData.variant}
              type="variant"
              label="Variant"
              onChange={onAutocompleteValueSelected}
              required
              error={errors.variant}
            />
          </FormControl>
          <FormControl fullWidth>
            <AutocompleteHandler
              defaultValue={editData.therapy}
              type="therapy"
              label="Therapy"
              onChange={onAutocompleteValueSelected}
              required
              error={errors.therapy}
            />
          </FormControl>
          <FormControl fullWidth>
            <AutocompleteHandler
              defaultValue={editData.context}
              type="context"
              label="Context"
              onChange={onAutocompleteValueSelected}
              required
              error={errors.context}
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
          <DialogActions>
            <Button color="primary" onClick={() => close()}>
              Cancel
            </Button>
            <Button color="primary" type="submit">
              Save
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}

EditDialog.propTypes = {
  editData: PropTypes.objectOf(PropTypes.any),
  open: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  reportIdent: PropTypes.string.isRequired,
  tableType: PropTypes.string.isRequired,
};

EditDialog.defaultProps = {
  editData: {},
};

export default EditDialog;
