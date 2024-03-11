import React, {
  useState, useEffect, useContext, useCallback,
} from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';

import api from '@/services/api';
import AsyncButton from '@/components/AsyncButton';

import ConfirmContext from '@/context/ConfirmContext';
import ReportContext from '@/context/ReportContext';
import snackbar from '@/services/SnackbarUtils';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import { ExpOutliersType } from '@/common';
import { GeneVariantType } from '../../../GenomicSummary/types';

import './index.scss';

type EditDialogProps = {
  editData: ExpOutliersType;
  isOpen: boolean;
  onClose: (newData?: ExpOutliersType) => void;
  showErrorSnackbar: (message: string) => void;
};

const EditDialog = ({
  editData,
  isOpen = false,
  onClose,
  showErrorSnackbar,
}: EditDialogProps): JSX.Element => {
  const { showConfirmDialog } = useConfirmDialog();
  const { report } = useContext(ReportContext);
  const { isSigned } = useContext(ConfirmContext);
  const [variant, setVariant] = useState('');
  const [variants, setVariants] = useState<GeneVariantType[]>();
  const [isApiCalling, setIsApiCalling] = useState(false);

  useEffect(() => {
    if (editData) {
      const newVariant = `${editData?.gene.name} (${editData?.expressionState})`;
      setVariant(newVariant);
    }
  }, [editData]);

  useEffect(() => {
    async function fetchVariants() {
      const variantsResp = api.get(`/reports/${report.ident}/summary/genomic-alterations-identified`).request();
      if (variantsResp) {
        setVariants(await variantsResp);
      }
    }

    fetchVariants();
  }, [report.ident]);

  const availableVariants = variants?.map(({ geneVariant }) => geneVariant);

  const handleSubmit = useCallback(async () => {
    if (!availableVariants.includes(variant)) {
      setIsApiCalling(true);
      const req = api.post(`/reports/${report.ident}/summary/genomic-alterations-identified`, { geneVariant: variant });
      try {
        if (isSigned) {
          showConfirmDialog(req);
          setIsApiCalling(false);
        } else {
          await req.request();
          onClose({ ...editData });
        }
        snackbar.success('Variant added to key alterations.');
      } catch (err) {
        showErrorSnackbar(`Error updating key alterations: ${err.message}`);
        onClose();
      } finally {
        setIsApiCalling(false);
      }
    } else {
      snackbar.error('Variant already in key alterations.');
      onClose();
    }
  }, [availableVariants, variant, report.ident, isSigned, showConfirmDialog, onClose, editData, showErrorSnackbar]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Dialog open={isOpen} maxWidth="sm" fullWidth className="edit-dialog">
      <DialogTitle>Key Alterations Edit</DialogTitle>
      <DialogContent>
        <div className="edit-dialog__body">
          <p>
            Small Mutation:
            {' '}
            {variant}
          </p>
        </div>
        <DialogActions className="edit-dialog__actions">
          <AsyncButton isLoading={isApiCalling} color="secondary" onClick={handleSubmit} component="label">
            Add to Summary
          </AsyncButton>
          <Button onClick={handleClose}>
            Cancel
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default EditDialog;
