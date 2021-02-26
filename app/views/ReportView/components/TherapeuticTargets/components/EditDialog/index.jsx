import './index.scss';

import React, {
  useState, useEffect, useCallback, useReducer, useContext,
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
import { therapeuticAdd, therapeuticDelete } from '../../../../../../services/reports/therapeutic';
import api from '@/services/api';
import ConfirmContext from '@/components/ConfirmContext';
import ReportContext from '@/components/ReportContext';

/**
 * @param {object} props props
 * @param {object} props.editData data passed to edit
 * @param {bool} props.isOpen is the dialog open
 * @param {func} props.onClose onClose function
 * @param {string} props.tableType therapeutic | chemoresistant
 * @return {*} JSX
 */
const EditDialog = (props) => {
  const {
    editData,
    isOpen,
    onClose,
    tableType,
  } = props;

  const [newData, setNewData] = useReducer((state, action) => {
    const { type: actionType, payload } = action;

    if (actionType === 'replace') {
      return { ...payload };
    }
    return { ...state, ...payload };
  }, editData || {});

  const { isSigned } = useContext(ConfirmContext);
  const { report } = useContext(ReportContext);

  const [dialogTitle, setDialogTitle] = useState('Add Row');
  const [requiredFields] = useState(['variant', 'context', 'therapy']);
  const [errors, setErrors] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (newData.ident) {
      setDialogTitle('Edit Row');
    } else {
      setDialogTitle('Add Row');
    }
  }, [newData]);

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
  }, [newData, requiredFields]);


  const handleSubmit = useCallback(async () => {
    const {
      ident,
      createdAt,
      updatedAt,
      rank,
      ...rest
    } = newData;
    const combinedData = { type: tableType, ...rest };

    try {
      if (newData.ident) { // existing option
        const returnedData = await api.put(
          `/reports/${report.ident}/therapeutic-targets/${editData.ident}`,
          combinedData,
        ).request(isSigned);
        setIsDirty(false);
        onClose(returnedData);
      } else {
        const returnedData = await therapeuticAdd(
          report.ident,
          combinedData,
        );
        setNewData({ type: 'replace', payload: {} });
        setIsDirty(false);
        onClose(returnedData);
      }
    } catch (err) {
      console.error(err); // TODO: send to snackbar
    }
  }, [newData, tableType, report, editData.ident, isSigned, onClose]);

  const handleDelete = useCallback(async () => {
    try {
      await therapeuticDelete(
        report.ident,
        newData.ident,
      );
      onClose(null);
    } catch (err) {
      console.error('error', err); // TODO: send to snackbar
    }
  }, [onClose, newData.ident, report.ident]);

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
};

EditDialog.propTypes = {
  editData: PropTypes.objectOf(PropTypes.any),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  tableType: PropTypes.string.isRequired,
};

EditDialog.defaultProps = {
  editData: {},
};

export default EditDialog;
