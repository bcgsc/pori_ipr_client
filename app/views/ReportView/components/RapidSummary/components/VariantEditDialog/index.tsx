import React, {
  useState, useEffect, useContext, useCallback,
} from 'react';
import {
  DialogTitle,
  DialogContent,
  Dialog,
  DialogProps,
  TextField,
  DialogActions,
  Button,
} from '@mui/material';
import ReportContext from '@/context/ReportContext';
import ConfirmContext from '@/context/ConfirmContext';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import api from '@/services/api';
import { RapidVariantType } from '../../types';

const VARIANT_TYPE_TO_API_MAP = {
  cnv: 'copy-variants',
  mut: 'small-mutations',
  sv: 'structural-variants',
};

interface VariantEditDialogProps extends DialogProps {
  editData: RapidVariantType & { potentialClinicalAssociation?: string };
  onClose: (newData: RapidVariantType) => void;
}

const VariantEditDialog = ({
  onClose,
  open,
  editData,
}: VariantEditDialogProps) => {
  const { report } = useContext(ReportContext);
  const { isSigned } = useContext(ConfirmContext);
  const { showConfirmDialog } = useConfirmDialog();
  const [data, setData] = useState(null);
  const [editDataDirty, setEditDataDirty] = useState<boolean>(false);

  useEffect(() => {
    if (editData) {
      setData(editData);
    }
  }, [editData]);

  const handleDataChange = useCallback((
    { target: { value, name } }: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setData((prevVal) => ({ ...prevVal, [name]: value }));
    if (!editDataDirty) {
      setEditDataDirty(true);
    }
  }, [editDataDirty]);

  const handleClose = useCallback(async () => {
    if (editDataDirty) {
      const putData = {
        comments: data?.comments,
      };

      let variantId = data?.ident;

      // The relevance was appeneded to Id due to row concatenation, needs to be removed here to call API
      if ((data).potentialClinicalAssociation) {
        variantId = variantId.substr(0, variantId.lastIndexOf('-'));
      }

      const apiCall = api.put(
        `/reports/${report.ident}/${VARIANT_TYPE_TO_API_MAP[data.variantType]}/${variantId}`,
        putData,
      );

      if (isSigned) {
        showConfirmDialog(apiCall);
      } else {
        const returnData = await apiCall.request();
        onClose(returnData);
      }
    } else {
      onClose(null);
    }
  }, [
    editDataDirty,
    data,
    report.ident,
    isSigned,
    showConfirmDialog,
    onClose,
  ]);

  return (
    <Dialog fullWidth open={open}>
      <DialogTitle>
        Edit Event
      </DialogTitle>
      <DialogContent className="patient-dialog__content">
        <TextField
          className="patient-dialog__text-field"
          label="comments"
          value={data?.comments ?? ''}
          name="comments"
          onChange={handleDataChange}
          variant="outlined"
          multiline
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          Close
        </Button>
        <Button color="secondary" onClick={handleClose}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VariantEditDialog;
