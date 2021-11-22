import React, {
  useState, useEffect, useCallback, useReducer, useContext,
} from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  TextField,
} from '@mui/material';

import api from '@/services/api';
import ConfirmContext from '@/context/ConfirmContext';
import ReportContext from '@/context/ReportContext';
import AsyncButton from '@/components/AsyncButton';
import AutocompleteHandler from '../AutocompleteHandler';

import './index.scss';
import TherapeuticTargetType from '../../types';

type EditDialogProps = {
  /* Data passed to edit */
  editData: Record<string, unknown>;
  /* Is the dialog open? */
  isOpen: boolean;
  /* Function called to close dialog */
  onClose: (newData?: null | Record<string, unknown>) => void;
  /* Used to differenciate tables if multiple on a page */
  tableType: string;
};

const EditDialog = ({
  editData = {},
  isOpen,
  onClose,
  tableType,
}: EditDialogProps): JSX.Element => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    const missing = requiredFields.filter((field) => !newData[field]);

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
    setIsSubmitting(true);
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
        const returnedData = await api.put<TherapeuticTargetType>(
          `/reports/${report.ident}/therapeutic-targets/${editData.ident}`,
          combinedData,
        ).request(isSigned);
        setIsDirty(false);
        onClose(returnedData);
      } else {
        const returnedData = await api.post<TherapeuticTargetType>(
          `/reports/${report.ident}/therapeutic-targets`,
          combinedData,
        ).request(isSigned);
        setNewData({ type: 'replace', payload: {} });
        setIsDirty(false);
        onClose(returnedData);
      }
    } catch (err) {
      console.error(err); // TODO: send to snackbar
    } finally {
      setIsSubmitting(false);
    }
  }, [newData, tableType, report, editData.ident, isSigned, onClose]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await api.del(
        `/reports/${report.ident}/therapeutic-targets/${newData.ident}`,
        {},
        {},
      ).request(isSigned);
      onClose(null);
    } catch (err) {
      console.error('error', err); // TODO: send to snackbar
    } finally {
      setIsDeleting(false);
    }
  }, [onClose, newData.ident, report.ident, isSigned]);

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

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
          {newData.ident && (
            <AsyncButton
              color="secondary"
              onClick={handleDelete}
              className="edit-dialog__actions--delete"
              isLoading={isDeleting}
            >
              Delete
            </AsyncButton>
          )}
          <Button color="secondary" onClick={() => onClose()}>
            Cancel
          </Button>
          <AsyncButton
            color="secondary"
            onClick={handleSubmit}
            disabled={Boolean(errors || !isDirty)}
            isLoading={isSubmitting}
          >
            Save
          </AsyncButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default EditDialog;
