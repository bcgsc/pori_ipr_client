import React, { useState, useEffect, useCallback } from 'react';
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
 * @param {number} props.addIndex index of table to add new row to
 * @return {*} JSX
 */
function EditDialog(props) {
  const {
    editData,
    open,
    close: onClose, // TODO: alias to std-naming until prop name can be changed
    reportIdent,
    tableType,
    addIndex,
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

  const handleSubmit = useCallback(async (event) => {
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

      onClose(combinedData);
    } else {
      combinedData = { type: tableType, rank: addIndex, ...newData };

      if (isMissingFields(combinedData)) {
        return;
      }

      const returnedData = await therapeuticAdd(
        reportIdent,
        combinedData,
      );

      onClose(returnedData);
    }
  }, [onClose]);

  const handleAutocompleteValueSelected = (selectedValue, typeName) => {
    if (selectedValue) {
      if (typeName === 'variant') {
        setNewData({
          ...newData,
          gene: selectedValue.reference2
            ? `${selectedValue.reference1.displayName}, ${selectedValue.reference2.displayName}`
            : selectedValue.reference1.displayName,
          variant: selectedValue['@class'].toLowerCase() === 'positionalvariant'
            ? selectedValue.displayName.split(':').slice(1).join()
            : selectedValue.type.displayName,
          variantGraphkbId: selectedValue['@rid'],
        });
      } else {
        setNewData({
          ...newData,
          [typeName]: selectedValue.displayName,
          [`${typeName}GraphkbId`]: selectedValue['@rid'],
        });
      }
    }
  };

  const handleNotesChange = (event) => {
    setNewData({
      ...newData,
      notes: event.target.value,
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
          <FormControl fullWidth>
            <AutocompleteHandler
              defaultValue={
                editData.variant && editData.gene
                  ? `${editData.gene} ${editData.variant}`
                  : ''
              }
              type="variant"
              label="Gene and Variant"
              onChange={handleAutocompleteValueSelected}
              required
              error={errors.variant}
            />
          </FormControl>
          <FormControl fullWidth>
            <AutocompleteHandler
              defaultValue={editData.therapy}
              type="therapy"
              label="Therapy"
              onChange={handleAutocompleteValueSelected}
              required
              error={errors.therapy}
            />
          </FormControl>
          <FormControl fullWidth>
            <AutocompleteHandler
              defaultValue={editData.context}
              type="context"
              label="Context"
              onChange={handleAutocompleteValueSelected}
              required
              error={errors.context}
            />
          </FormControl>
          <FormControl fullWidth>
            <AutocompleteHandler
              defaultValue={editData.evidenceLevel}
              type="evidenceLevel"
              label="Evidence Level"
              onChange={handleAutocompleteValueSelected}
              minCharacters={1}
            />
          </FormControl>
          <FormControl fullWidth>
            <TextField
              label="Notes"
              variant="outlined"
              margin="normal"
              value={newData.notes || undefined}
              onChange={handleNotesChange}
              multiline
            />
          </FormControl>
          <DialogActions>
            <Button color="primary" onClick={() => onClose()}>
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
  addIndex: PropTypes.number,
};

EditDialog.defaultProps = {
  editData: {},
  addIndex: 0,
};

export default EditDialog;
