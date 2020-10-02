import './index.scss';

import React, {
  useState, useEffect, useCallback, useReducer,
} from 'react';
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
import { therapeuticAdd, therapeuticUpdate, therapeuticDelete } from '../../../../../../services/reports/therapeutic';

/**
 * @param {object} props props
 * @param {object} props.editData data passed to edit
 * @param {bool} props.isOpen is the dialog open
 * @param {func} props.onClose onClose function
 * @param {string} props.reportIdent ident of current report
 * @param {string} props.tableType therapeutic | chemoresistant
 * @param {number} props.addIndex index of table to add new row to
 * @return {*} JSX
 */
function EditDialog(props) {
  const {
    editData,
    isOpen,
    onClose,
    reportIdent,
    tableType,
    addIndex,
  } = props;

  const [newData, setNewData] = useReducer((state, action) => {
    const { type: actionType, payload } = action;

    if (actionType === 'replace') {
      return { ...payload };
    }
    return { ...state, ...payload };
  }, editData || {});

  const dialogTitle = newData.ident ? 'Edit Row' : 'Add Row';

  const [requiredFields] = useState(['variant', 'context', 'therapy']);
  const [errors, setErrors] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setNewData({ type: 'replace', payload: editData || {} });
  }, [editData]);

  useEffect(() => {
    const missing = requiredFields.filter(field => !newData[field]);

    if (missing.length) {
      setErrors(missing.reduce((acc, curr) => {
        acc[curr] = `${curr} is required`;
        return acc;
      }, {}));
    } else {
      setErrors(null);
    }
  }, [newData]);


  const handleSubmit = useCallback(async () => {
    const { ident, createdAt, updatedAt, rank, ...rest } = newData;
    const combinedData = { type: tableType, ...rest };

    try {
      if (newData.ident) { // existing option
        await therapeuticUpdate(
          reportIdent,
          editData.ident,
          combinedData,
        );
        setIsDirty(false);
        onClose(combinedData);
      } else {
        const returnedData = await therapeuticAdd(
          reportIdent,
          combinedData,
        );
        setNewData({ type: 'replace', payload: {} });
        setIsDirty(false);
        onClose(returnedData);
      }
    } catch (err) {
      console.error(err); // TODO: send to snackbar
    }
  }, [reportIdent, onClose, newData]);

  const handleDelete = useCallback(async () => {
    try {
      await therapeuticDelete(
        reportIdent,
        newData.ident,
      );
      onClose(null);
    } catch (err) {
      console.error('error', err); // TODO: send to snackbar
    }
  }, [onClose, newData.ident, reportIdent]);

  const handleAutocompleteValueSelected = (selectedValue, typeName) => {
    setIsDirty(true);
    if (selectedValue) {
      if (typeName === 'variant') {
        setNewData({
          payload: {
            gene: selectedValue.reference1 && selectedValue.reference2
              ? `${selectedValue.reference1.displayName}, ${selectedValue.reference2.displayName}`
              : selectedValue.reference1.displayName || selectedValue.reference2.displayName,
            variant: selectedValue['@class'].toLowerCase() === 'positionalvariant'
              ? selectedValue.displayName.split(':').slice(1).join()
              : selectedValue.type.displayName,
            variantGraphkbId: selectedValue['@rid'],
          },
        });
      } else {
        setNewData({
          payload: {
            [typeName]: selectedValue.displayName,
            [`${typeName}GraphkbId`]: selectedValue['@rid'],
          },
        });
      }
    }
  };

  const handleNotesChange = (event) => {
    setIsDirty(true);
    setNewData({
      payload: {
        notes: event.target.value,
      },
    });
  };

  return (
    <Dialog open={isOpen} maxWidth="sm" fullWidth className="edit-dialog">
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth>
          <AutocompleteHandler
            defaultValue={
              newData.variant && newData.gene
                ? `${newData.gene} ${newData.variant}`
                : ''
            }
            type="variant"
            label="Gene and Variant"
            onChange={handleAutocompleteValueSelected}
            required
            error={errors && isDirty && errors.variant}
          />
        </FormControl>
        <FormControl fullWidth>
          <AutocompleteHandler
            defaultValue={newData.therapy}
            type="therapy"
            label="Therapy"
            onChange={handleAutocompleteValueSelected}
            required
            error={errors && isDirty && errors.therapy}
          />
        </FormControl>
        <FormControl fullWidth>
          <AutocompleteHandler
            defaultValue={newData.context}
            type="context"
            label="Context"
            onChange={handleAutocompleteValueSelected}
            required
            error={errors && isDirty && errors.context}
          />
        </FormControl>
        <FormControl fullWidth>
          <AutocompleteHandler
            defaultValue={newData.evidenceLevel}
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
        <DialogActions className="edit-dialog__actions">
          {
            newData.ident && (
              <Button color="primary" onClick={handleDelete} className="edit-dialog__actions--delete">
                Delete
              </Button>
            )
          }
          <Button color="primary" onClick={() => onClose()}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleSubmit} disabled={Boolean(errors || !isDirty)}>
            Save
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

EditDialog.propTypes = {
  editData: PropTypes.objectOf(PropTypes.any),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  reportIdent: PropTypes.string.isRequired,
  tableType: PropTypes.string.isRequired,
  addIndex: PropTypes.number,
};

EditDialog.defaultProps = {
  editData: {},
  addIndex: 0,
};

export default EditDialog;
