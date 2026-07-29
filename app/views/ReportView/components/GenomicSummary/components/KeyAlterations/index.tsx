/* eslint-disable no-param-reassign */
import React, {
  useEffect, useState, useCallback, useContext, useMemo,
} from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import sortBy from 'lodash/sortBy';

import api, { ApiCallSet } from '@/services/api';
import ConfirmContext from '@/context/ConfirmContext';
import ReportContext from '@/context/ReportContext';
import snackbar from '@/services/SnackbarUtils';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import useConfirmDialog from '@/hooks/useConfirmDialog';

import VariantCounts from '../VariantCounts';
import GenomicAlterationsTable from '../GenomicAlterationsTable';

import {
  GeneVariantType,
} from '../../types';

import './index.scss';

const variantCategory = (variant: GeneVariantType) => {
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

const customTypeSort = (variant: GeneVariantType) => {
  if (variant.type === 'smallMutation') return 0;
  if (variant.type === 'cnv') return 1;
  if (variant.type === 'structuralVariant') return 2;
  return 3;
};

const createBaseGene = (name = '') => ({
  kbStatementRelated: false,
  drugTargetable: false,
  expressionVariants: null,
  copyVariants: null,
  knownFusionPartner: false,
  knownSmallMutation: false,
  name,
  oncogene: false,
  therapeuticAssociated: false,
  tumourSuppressor: false,
});

const transformManualVariantToData = (variant: GeneVariantType): GeneVariantType => {
  const categorizedVariant = variantCategory(variant);
  const [leftPart = '', rightPart = ''] = categorizedVariant.geneVariant.split(':');
  const parenMatch = categorizedVariant.geneVariant.match(/^(.*?)\s*\((.*?)\)\s*$/);

  switch (categorizedVariant.type) {
    case 'smallMutation': {
      const geneName = leftPart || (parenMatch?.[1] ?? categorizedVariant.geneVariant);
      const proteinChange = rightPart || categorizedVariant.geneVariant;
      categorizedVariant.variant = {
        altSeq: null,
        chromosome: null,
        comments: null,
        displayName: categorizedVariant.geneVariant,
        endPosition: null,
        exon: null,
        gene: createBaseGene(geneName.trim()),
        hgvsCds: null,
        hgvsGenomic: null,
        hgvsProtein: proteinChange,
        library: null,
        ncbiBuild: null,
        normalAltCount: null,
        normalDepth: null,
        normalRefCount: null,
        proteinChange,
        refSeq: null,
        rnaAltCount: null,
        rnaDepth: null,
        rnaRefCount: null,
        selected: false,
        startPosition: null,
        transcript: null,
        tumourAltCopies: null,
        tumourAltCount: null,
        tumourDepth: null,
        tumourRefCopies: null,
        tumourRefCount: null,
        variantType: 'mut',
        zygosity: null,
      } as any;
      break;
    }
    case 'cnv': {
      const geneName = (parenMatch?.[1] ?? categorizedVariant.geneVariant).trim();
      const cnvState = parenMatch?.[2] ?? null;
      categorizedVariant.variant = {
        chromosomeBand: null,
        cna: null,
        cnvState,
        comments: null,
        copyChange: null,
        displayName: categorizedVariant.geneVariant,
        end: null,
        gene: createBaseGene(geneName),
        kbCategory: null,
        lohState: null,
        selected: false,
        size: null,
        start: null,
        variantType: 'cnv',
      } as any;
      break;
    }
    case 'structuralVariant': {
      const genes = categorizedVariant.geneVariant
        .replace(/fusion/ig, '')
        .split('::')
        .map((val) => val.trim())
        .filter(Boolean);

      const gene1Name = genes[0] ?? categorizedVariant.geneVariant;
      const gene2Name = genes[1] ?? '';

      categorizedVariant.variant = {
        breakpoint: null,
        comments: null,
        conventionalName: categorizedVariant.geneVariant,
        ctermGene: null,
        ctermTranscript: null,
        detectedIn: null,
        displayName: categorizedVariant.geneVariant,
        eventType: null,
        exon1: null,
        exon2: null,
        frame: null,
        gene1: createBaseGene(gene1Name),
        gene2: createBaseGene(gene2Name),
        highQuality: false,
        mavis_product_id: null,
        name: categorizedVariant.geneVariant,
        ntermGene: null,
        ntermTranscript: null,
        omicSupport: false,
        selected: false,
        svg: null,
        svgTitle: null,
        variantType: 'sv',
      } as any;
      break;
    }
    case 'expression': {
      const geneName = (parenMatch?.[1] ?? categorizedVariant.geneVariant).trim();
      const expressionState = parenMatch?.[2] ?? null;
      categorizedVariant.variant = {
        biopsySiteFoldChange: null,
        biopsySitePercentile: null,
        biopsySiteQC: null,
        biopsySiteZScore: null,
        biopsySitekIQR: null,
        diseaseFoldChange: null,
        diseasePercentile: null,
        diseaseQC: null,
        diseaseZScore: null,
        diseasekIQR: null,
        expressionState,
        gene: createBaseGene(geneName),
        kbCategory: null,
        location: null,
        primarySiteFoldChange: null,
        primarySitePercentile: null,
        primarySiteQC: null,
        primarySiteZScore: null,
        primarySitekIQR: null,
        rnaReads: null,
        rpkm: null,
        selected: false,
        tpm: null,
        variantType: 'exp',
      } as any;
      break;
    }
    default:
      break;
  }

  return categorizedVariant;
};

type KeyAlterationsProps = {
  loadedDispatch?: ({ type }: { type: string }) => void;
  isPrint: boolean;
  printVersion?: 'standardLayout' | 'condensedLayout' | null;
} & WithLoadingInjectedProps;

const KeyAlterations = ({
  isPrint = false,
  printVersion = null,
  setIsLoading,
  isLoading,
  loadedDispatch,
}: KeyAlterationsProps): JSX.Element => {
  const { report } = useContext(ReportContext);
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newGeneVariant, setNewGeneVariant] = useState('');
  const [isAddingVariant, setIsAddingVariant] = useState(false);

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

          const associatedVariants = variantsResp.filter((variant) => variant.variantType !== null);
          const manualVariants = variantsResp.filter((variant) => variant.variantType === null);

          associatedVariants.forEach((variant) => {
            // Add processed Variant
            output.push(variantCategory(variant));

            // Update counts
            if (!counts[variant.type]) {
              counts[variant.type] = 0;
            }
            counts[variant.type] += 1;
          });

          manualVariants.forEach((variant) => {
            const transformedVariant = transformManualVariantToData(variant);
            output.push(transformedVariant);

            if (!counts[transformedVariant.type]) {
              counts[transformedVariant.type] = 0;
            }
            counts[transformedVariant.type] += 1;
          });

          const sorted = sortBy(output, [customTypeSort, 'geneVariant']);
          setVariants(sorted);
          setVariantCounts(counts);
        } catch (err) {
          snackbar.error(`Network error: ${err?.message ?? err}`);
        } finally {
          setIsLoading(false);
          if (loadedDispatch) {
            loadedDispatch({ type: 'alterations' });
          }
        }
      };

      getData();
    }
  }, [loadedDispatch, report, setIsLoading, isPrint]);

  const handleVariantDeleted = useCallback(async (variantIdent, type, comment?) => {
    try {
      console.log('Deleting variant', variantIdent, type, comment);
      const req = api.del(
        `/reports/${report.ident}/summary/genomic-alterations-identified/${variantIdent}`,
        { comment },
      );

      if (isSigned) {
        showConfirmDialog(req);
      } else {
        await req.request();
        setVariantCounts((prevVal) => ({ ...prevVal, [type]: prevVal[type] - 1 }));
        setVariants((prevVal) => (prevVal.filter((val) => val.ident !== variantIdent)));
        snackbar.success('Entry deleted');
      }
    } catch (err) {
      snackbar.error('Entry NOT deleted due to an error');
    }
  }, [report, isSigned, showConfirmDialog]);

  const handleTableDeleted = useCallback(async (rowData) => {
    const variantIdent = typeof rowData === 'string' ? rowData : rowData?.ident;
    const rowType = typeof rowData === 'string' ? undefined : rowData?.type;
    const type = rowType ?? variants?.find((variant) => variant.ident === variantIdent)?.type;

    if (!variantIdent || !type) {
      snackbar.error('Entry NOT deleted due to an error');
      return;
    }

    await handleVariantDeleted(variantIdent, type);
  }, [handleVariantDeleted, variants]);

  const handleAddDialogOpen = useCallback(() => {
    setIsAddDialogOpen(true);
  }, []);

  const handleAddDialogClose = useCallback(() => {
    if (isAddingVariant) {
      return;
    }
    setIsAddDialogOpen(false);
    setNewGeneVariant('');
  }, [isAddingVariant]);

  const handleVariantAdded = useCallback(async () => {
    const geneVariant = newGeneVariant.trim();
    if (!geneVariant) {
      return;
    }

    try {
      setIsAddingVariant(true);
      const req = api.post(`/reports/${report.ident}/summary/genomic-alterations-identified`, { geneVariant });
      const newVariantEntry = await req.request() as GeneVariantType;

      const categorizedVariantEntry = newVariantEntry.variantType === null
        ? transformManualVariantToData(newVariantEntry)
        : variantCategory(newVariantEntry);

      setVariantCounts((prevVal) => ({
        ...prevVal,
        [categorizedVariantEntry.type]: (prevVal[categorizedVariantEntry.type] ?? 0) + 1,
      }));
      setVariants((prevVal) => sortBy(
        [...(prevVal ?? []), categorizedVariantEntry],
        [customTypeSort, 'geneVariant'],
      ));
      setIsAddDialogOpen(false);
      setNewGeneVariant('');
      snackbar.success('Entry added');
    } catch (err) {
      snackbar.error('Entry NOT added due to an error');
    } finally {
      setIsAddingVariant(false);
    }
  }, [newGeneVariant, report]);

  const alterationsSection = useMemo(() => {
    const variantTypes = ['smallMutation', 'cnv', 'structuralVariant', 'expression'];

    const renderTablesByType = (types: string[]) => types.map((type) => {
      const categoryData = variants?.filter((variant) => variant.type === type) ?? [];
      if (!categoryData.length) {
        return null;
      }
      return (
        <GenomicAlterationsTable
          key={type}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          isPrint={isPrint}
          variantCategory={type}
          variantData={categoryData.map((data) => ({ ...data.variant, ident: data.ident }))}
          onDelete={handleTableDeleted}
        />
      );
    }).filter(Boolean);

    let titleSection = (
      <div
        className={`${classNamePrefix}__standardLayout-title`}
        style={{
          alignItems: 'center',
          display: 'flex',
          gap: '12px',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h3">
          Genomic and Transcriptomic Alterations Identified
        </Typography>
        {!isPrint && (
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={handleAddDialogOpen}
          >
            Add New Alteration
          </Button>
        )}
      </div>
    );
    const standardTypes = variantTypes
      .filter((type) => (!variantFilter || type === variantFilter))
      .filter((type) => variants?.some((variant) => variant.type === type));

    const standardTables = renderTablesByType(standardTypes);

    if (printVersion === 'condensedLayout') {
      titleSection = (
        <Typography
          className={`${classNamePrefix}__print-title`}
          variant="h5" 
          fontWeight="bold" 
          display="block"
        >
          Genomic and Transcriptomic Alterations Identified
        </Typography>
      );

      const condensedTypes = variantTypes.filter((type) => variants?.some((variant) => variant.type === type));
      const condensedTables = renderTablesByType(condensedTypes);
      const [firstTable, ...remainingTables] = condensedTables;

      if (isPrint) {
        return (
          <div className={`${classNamePrefix}__render`}>
            <div className={`${classNamePrefix}__printKeepWithFirstTable`}>
              {titleSection}
              <div className={`${classNamePrefix}__condensedLayout-content`}>
                {firstTable}
              </div>
            </div>
            {remainingTables.length > 0 && (
              <div className={`${classNamePrefix}__condensedLayout-content`}>
                {remainingTables}
              </div>
            )}
          </div>
        );
      }

      return (
        <div className={`${classNamePrefix}__render`}>
          {titleSection}
          <div className={`${classNamePrefix}__condensedLayout-content`}>
            {condensedTables}
          </div>
        </div>
      );
    }

    const [firstTable, ...remainingTables] = standardTables;

    if (isPrint) {
      return (
        <div className={`${classNamePrefix}__render`}>
          <div className={`${classNamePrefix}__printKeepWithFirstTable`}>
            {titleSection}
            <div className={`${classNamePrefix}__standardLayout-content`}>
              <VariantCounts
                filter={variantFilter}
                counts={variantCounts}
                onToggleFilter={setVariantFilter}
              />
              {firstTable}
            </div>
          </div>
          {remainingTables.length > 0 && (
            <div className={`${classNamePrefix}__standardLayout-content`}>
              {remainingTables}
            </div>
          )}
        </div>
      );
    }

    const dataSection = (
      <div className={`${classNamePrefix}__standardLayout-content`}>
        <VariantCounts
          filter={variantFilter}
          counts={variantCounts}
          onToggleFilter={setVariantFilter}
        />
        {standardTables}
      </div>
    );

    return (
      <div className={`${classNamePrefix}__render`}>
        {titleSection}
        {dataSection}
        {!isPrint && (
          <Dialog
            open={isAddDialogOpen}
            onClose={handleAddDialogClose}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Add New Alteration</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Gene Variant"
                value={newGeneVariant}
                onChange={(event) => setNewGeneVariant(event.target.value)}
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleAddDialogClose} disabled={isAddingVariant}>Cancel</Button>
              <Button
                onClick={handleVariantAdded}
                disabled={isAddingVariant || !newGeneVariant.trim()}
                variant="contained"
                color="primary"
              >
                Add
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </div>
    );
  }, [
    classNamePrefix,
    handleAddDialogClose,
    handleAddDialogOpen,
    handleTableDeleted,
    handleVariantAdded,
    isAddDialogOpen,
    isAddingVariant,
    isLoading,
    isPrint,
    newGeneVariant,
    printVersion,
    setIsLoading,
    variantCounts,
    variantFilter,
    variants,
  ]);

  if (isLoading || !report || !alterationsSection) {
    return null;
  }

  return (
    <div className={classNamePrefix}>
      {alterationsSection}
    </div>
  );
};

export default withLoading(KeyAlterations);
