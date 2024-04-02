/* eslint-disable no-param-reassign */
import React, {
  useEffect, useState, useCallback, useContext, useMemo,
} from 'react';
import {
  Typography,
  Box,
} from '@mui/material';
import sortBy from 'lodash/sortBy';

import api, { ApiCallSet } from '@/services/api';
import ConfirmContext from '@/context/ConfirmContext';
import ReportContext from '@/context/ReportContext';
import snackbar from '@/services/SnackbarUtils';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import SummaryPrintTable from '@/components/SummaryPrintTable';
import useReport from '@/hooks/useReport';

import VariantChips from '../VariantChips';
import VariantCounts from '../VariantCounts';
import {
  GeneVariantType,
} from '../../types';

import './index.scss';

const variantCategory = (variant) => {
  // small mutations
  if (/[:(][gcp]\./.exec(variant.geneVariant)) {
    variant.type = 'smallMutation';
    return variant;
  }
  // Structural Variants
  if (variant.geneVariant.includes('::') || variant.geneVariant.includes('fusion')) {
    variant.type = 'structuralVariant';
    return variant;
  }
  // Expression Outliers
  if (variant.geneVariant.toLowerCase().includes('express')
      || variant.geneVariant.toLowerCase().includes('outlier')
      || variant.geneVariant.toLowerCase().includes('percentile')
  ) {
    variant.type = 'expression';
    return variant;
  }
  variant.type = 'cnv';
  return variant;
};

const customTypeSort = (variant) => {
  if (variant.type === 'smallMutation') return 0;
  if (variant.type === 'cnv') return 1;
  if (variant.type === 'structuralVariant') return 2;
  return 3;
};

  type KeyAlterationsProps = {
    isPrint: boolean;
    printVersion?: 'stable' | 'beta' | null;
  } & WithLoadingInjectedProps;

const KeyAlterations = ({
  isPrint = false,
  printVersion = null,
  setIsLoading,
}: KeyAlterationsProps): JSX.Element => {
  const { report } = useContext(ReportContext);
  const { canEdit } = useReport();
  const { isSigned } = useContext(ConfirmContext);
  const { showConfirmDialog } = useConfirmDialog();
  const [variants, setVariants] = useState<GeneVariantType[]>();
  const [variantFilter, setVariantFilter] = useState<string>('');
  const [variantCounts, setVariantCounts] = useState({
    smallMutation: 0,
    cnv: 0,
    structuralVariant: 0,
    expression: 0,
  });

  const classNamePrefix = printVersion ? 'key-alterations-print' : 'key-alterations';

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const apiCalls = new ApiCallSet([
            api.get(`/reports/${report.ident}/summary/genomic-alterations-identified`),
          ]);
          const [
            variantsResp,
          ] = await apiCalls.request() as [
            GeneVariantType[],
          ];

          const output = [];
          const counts = {
            smallMutation: 0,
            cnv: 0,
            structuralVariant: 0,
            expression: 0,
          };

          variantsResp.forEach((variant, k) => {
            // Add processed Variant
            output.push(variantCategory(variant));

            // Update counts
            if (!counts[variantsResp[k].type]) {
              counts[variantsResp[k].type] = 0;
            }
            counts[variantsResp[k].type] += 1;
          });
          const sorted = sortBy(output, [customTypeSort, 'geneVariant']);
          setVariants(sorted);
          setVariantCounts(counts);
        } catch (err) {
          snackbar.error(`Network error: ${err?.message ?? err}`);
        } finally {
          setIsLoading(false);
        }
      };

      getData();
    }
  }, [report, setIsLoading, isPrint]);

  const handleChipDeleted = useCallback(async (chipIdent, type, comment) => {
    try {
      const req = api.del(
        `/reports/${report.ident}/summary/genomic-alterations-identified/${chipIdent}`,
        { comment },
      );

      if (isSigned) {
        showConfirmDialog(req);
      } else {
        await req.request();
        setVariantCounts((prevVal) => ({ ...prevVal, [type]: prevVal[type] - 1 }));
        setVariants((prevVal) => (prevVal.filter((val) => val.ident !== chipIdent)));
        snackbar.success('Entry deleted');
      }
    } catch (err) {
      snackbar.error('Entry NOT deleted due to an error');
    }
  }, [report, isSigned, showConfirmDialog]);

  const handleChipAdded = useCallback(async (variant) => {
    try {
      const req = api.post(`/reports/${report.ident}/summary/genomic-alterations-identified`, { geneVariant: variant });
      const newVariantEntry = await req.request();

      const categorizedVariantEntry = variantCategory(newVariantEntry);

      setVariantCounts((prevVal) => ({ ...prevVal, [categorizedVariantEntry.type]: prevVal[categorizedVariantEntry.type] + 1 }));
      setVariants((prevVal) => ([...prevVal, categorizedVariantEntry]));
      snackbar.success('Entry added');
    } catch (err) {
      snackbar.error('Entry NOT added due to an error');
    }
  }, [report]);

  const alterationsSection = useMemo(() => {
    let titleSection = (
      <div className={`${classNamePrefix}__stable-title`}>
        <Typography variant="h3">
          Key Genomic and Transcriptomic Alterations Identified
        </Typography>
      </div>
    );
    let dataSection = (
      <div className={`${classNamePrefix}__stable-content`}>
        <VariantCounts
          filter={variantFilter}
          counts={variantCounts}
          onToggleFilter={setVariantFilter}
        />
        <VariantChips
          variants={variantFilter ? variants.filter((v) => v.type === variantFilter) : variants}
          canEdit={canEdit}
          onChipDeleted={handleChipDeleted}
          onChipAdded={handleChipAdded}
          isPrint={Boolean(printVersion)}
        />
      </div>
    );

    if (printVersion === 'beta') {
      titleSection = (
        <Typography variant="h5" fontWeight="bold" display="inline">Key Genomic and Transcriptomic Alterations Identified</Typography>
      );
      if (variants) {
        const uniqueTypesArray = [...new Set(variants.map(({ type }) => type))].sort();
        const categorizedDataArray = [];
        uniqueTypesArray.forEach((variantType) => {
          categorizedDataArray.push({
            key: variantType,
            value: variants.filter(({ type }) => type === variantType),
          });
        });
        dataSection = (
          <div className={`${classNamePrefix}__beta-content`}>
            <SummaryPrintTable
              data={categorizedDataArray}
              labelKey="key"
              valueKey="value"
              renderValue={(val) => val.map(({ geneVariant }, index, arr) => (
                <>
                  <Box sx={{ paddingLeft: 0.75, display: 'inline-block' }}>
                    <Typography variant="caption">{geneVariant}</Typography>
                  </Box>
                  {(index < arr.length - 1 ? ', ' : '')}
                </>
              ))}
            />
          </div>
        );
      }
    }

    return (
      <div className={`${classNamePrefix}__render`}>
        {titleSection}
        {dataSection}
      </div>
    );
  }, [canEdit, classNamePrefix, handleChipAdded, handleChipDeleted, printVersion, variantCounts, variantFilter, variants]);

  return (
    <div className={classNamePrefix}>
      {alterationsSection}
    </div>
  );
};

export default withLoading(KeyAlterations);
