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
import {
  CopyNumberType, SmallMutationType, StructuralVariantType, ExpOutliersType,
} from '@/common';
import { GeneVariantType } from '@/views/ReportView/components/GenomicSummary/types';

import './index.scss';

type VariantEditDialogProps = {
  editData: SmallMutationType | CopyNumberType | StructuralVariantType | ExpOutliersType;
  variantType: string;
  isOpen: boolean;
  onClose: (newData?: SmallMutationType | CopyNumberType | StructuralVariantType | ExpOutliersType) => void;
};

const VariantEditDialog = ({
  editData,
  variantType,
  isOpen = false,
  onClose,
}: VariantEditDialogProps): JSX.Element => {
  const { showConfirmDialog } = useConfirmDialog();
  const { report } = useContext(ReportContext);
  const { isSigned } = useContext(ConfirmContext);
  const [variant, setVariant] = useState('');
  const [variants, setVariants] = useState<GeneVariantType[]>();
  const [isApiCalling, setIsApiCalling] = useState(false);

  useEffect(() => {
    if (editData) {
      let newVariant;
      switch (variantType) {
        case 'snv':
          newVariant = `${editData?.gene.name}:${editData?.proteinChange}`;
          setVariant(newVariant);
          break;
        case 'cnv':
          newVariant = `${editData?.gene.name} (${editData?.cnvState})`;
          setVariant(newVariant);
          break;
        case 'sv':
          newVariant = `${editData?.displayName}`;
          setVariant(newVariant);
          break;
        case 'exp':
          newVariant = `${editData?.gene.name} (${editData?.expressionState})`;
          setVariant(newVariant);
          break;
        default:
          break;
      }
    }
  }, [editData, variantType]);

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
          snackbar.success('Variant added to key alterations.');
        }
      } catch (err) {
        snackbar.error(`Error updating key alterations: ${err.message}`);
        onClose();
      } finally {
        setIsApiCalling(false);
      }
    } else {
      snackbar.error('Variant already in key alterations.');
      onClose();
    }
  }, [availableVariants, variant, report.ident, isSigned, showConfirmDialog, onClose, editData]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Dialog open={isOpen} maxWidth="sm" fullWidth className="variant-edit-dialog">
      <DialogTitle>Key Alterations Edit</DialogTitle>
      <DialogContent>
        <div className="variant-edit-dialog__body">
          <p>
            Variant:
            {' '}
            {variant}
          </p>
        </div>
        <DialogActions className="variant-edit-dialog__actions">
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

export default VariantEditDialog;
