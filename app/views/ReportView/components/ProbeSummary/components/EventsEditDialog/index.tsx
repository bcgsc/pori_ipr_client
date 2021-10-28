import React, {
  useState, useEffect, useCallback, useContext,
} from 'react';
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  TextField,
  Button,
} from '@material-ui/core';

import ReportContext from '@/context/ReportContext';
import ConfirmContext from '@/context/ConfirmContext';
import api from '@/services/api';
import { GeneType } from '@/common';
import GeneAutocomplete from '../GeneAutocomplete';
import ProbeResultsType from '../../types';

type EventsEditDialogProps = {
  isOpen: boolean;
  onClose: (isSaved?: ProbeResultsType) => void;
  editData: Record<string, string | GeneType>;
};

const EventsEditDialog = ({
  editData,
  isOpen,
  onClose,
}: EventsEditDialogProps): JSX.Element => {
  const { report } = useContext(ReportContext);
  const { isSigned } = useContext(ConfirmContext);

  const [newData, setNewData] = useState<Record<string, string | GeneType>>();
  const [editDataDirty, setEditDataDirty] = useState<boolean>(false);

  useEffect(() => {
    if (editData) {
      setNewData(editData);
    }
  }, [editData]);

  useEffect(() => {
    if (!isOpen) {
      setEditDataDirty(false);
    }
  }, [isOpen]);

  const handleDataChange = useCallback((
    { target: { value, name } }: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setNewData((prevVal) => ({ ...prevVal, [name]: value }));
    if (!editDataDirty) {
      setEditDataDirty(true);
    }
  }, [editDataDirty]);

  const handleAutocompleteChange = (newGene: GeneType) => {
    setNewData((prevVal) => ({ ...prevVal, gene: newGene }));
    if (!editDataDirty) {
      setEditDataDirty(true);
    }
  };

  const handleClose = useCallback(async (isSaved) => {
    if (isSaved && editDataDirty) {
      const putData = {
        comments: newData.comments,
        variant: newData.variant,
        gene: newData?.gene?.ident,
      };

      const returnData = await api.put<ProbeResultsType>(
        `/reports/${report.ident}/probe-results/${newData.ident}`,
        putData,
      ).request(isSigned);

      onClose(returnData);
    } else {
      onClose();
    }
  }, [editDataDirty, isSigned, newData, onClose, report.ident]);

  return (
    <Dialog open={isOpen}>
      <DialogTitle>
        Edit Event
      </DialogTitle>
      <DialogContent className="patient-dialog__content">
        <>
          <GeneAutocomplete
            defaultValue={newData?.gene as GeneType}
            onChange={handleAutocompleteChange}
          />
          <TextField
            className="patient-dialog__text-field"
            label="Variant"
            value={newData?.variant}
            name="variant"
            onChange={handleDataChange}
            variant="outlined"
            multiline
            fullWidth
          />
          <TextField
            className="patient-dialog__text-field"
            label="comments"
            value={newData?.comments}
            name="comments"
            onChange={handleDataChange}
            variant="outlined"
            multiline
            fullWidth
          />
        </>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose(false)}>
          Close
        </Button>
        <Button color="secondary" onClick={() => handleClose(true)}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventsEditDialog;
