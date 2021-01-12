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

import ReportContext from '../../../../../../components/ReportContext';
import ConfirmContext from '../../../../../../components/ConfirmContext';
import api from '../../../../../../services/api';

type Props = {
  isOpen: boolean,
  onClose: (isSaved?: Record<string, unknown>) => void,
  editData: Record<string, unknown>
};

const EventsEditDialog = ({
  editData,
  isOpen,
  onClose,
}: Props): JSX.Element => {
  const { report } = useContext(ReportContext);
  const { isSigned } = useContext(ConfirmContext);

  const [newData, setNewData] = useState<Record<string, unknown | Record<string, unknown>>>();
  const [editDataDirty, setDataDirty] = useState<boolean>(false);

  useEffect(() => {
    if (editData) {
      setNewData(editData);
    }
  }, [editData]);

  const handleDataChange = (event) => {
    const { target: { value, name } } = event;

    let prop: string = name;
    let subprop: string | null;

    if (prop.includes('.')) {
      [prop, subprop] = prop.split('.');
      setNewData(prevVal => ({ ...prevVal, [prop]: { [subprop]: value } }));
    } else {
      setNewData(prevVal => ({ ...prevVal, [prop]: value }));
    }

    if (!editDataDirty) {
      setDataDirty(true);
    }
  };

  const handleClose = useCallback(async (isSaved) => {
    if (isSaved && editDataDirty) {
      const call = api.put(`/reports/${report.ident}/probe-results/${newData.ident}`, newData, {});
      await call.request(isSigned);
      onClose(newData);
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
        {newData?.gene?.name && (
          <>
            <TextField
              className="patient-dialog__text-field"
              label="Gene"
              value={newData.gene.name}
              name="gene.name"
              onChange={handleDataChange}
              variant="outlined"
              multiline
              fullWidth
            />
            <TextField
              className="patient-dialog__text-field"
              label="Variant"
              value={newData.variant}
              name="variant"
              onChange={handleDataChange}
              variant="outlined"
              multiline
              fullWidth
            />
            <TextField
              className="patient-dialog__text-field"
              label="comments"
              value={newData.comments}
              name="comments"
              onChange={handleDataChange}
              variant="outlined"
              multiline
              fullWidth
            />
          </>
        )}
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
