import React, {
  useEffect,
} from 'react';
import { Typography } from '@mui/material';
import { ColDef, ColGroupDef } from '@ag-grid-community/core';

import PrintTable from '@/components/PrintTable';
import DataTable from '@/components/DataTable';
import { SmallMutationType, CopyNumberType, StructuralVariantType, ExpOutliersType } from '@/common';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import { smallMutationsColumnDefs, copyNumberColumnDefs, structuralVariantsColumnDefs, expressionColumnDefs } from './columnDefs';

import './index.scss';

type GenomicAlterationsTableProps = WithLoadingInjectedProps & {
  onDelete?: (rowData: SmallMutationType | CopyNumberType | StructuralVariantType | ExpOutliersType) => void;
  variantCategory: string;
  variantData: SmallMutationType[] | CopyNumberType[] | StructuralVariantType[] | ExpOutliersType[];
  isPrint?: boolean;
};

type SmallMutationsProps = WithLoadingInjectedProps & {
  onDelete?: (rowData: SmallMutationType) => void;
  variantData: SmallMutationType[];
  isPrint?: boolean;
};

type CopyNumberProps = WithLoadingInjectedProps & {
  onDelete?: (rowData: CopyNumberType) => void;
  variantData: CopyNumberType[];
  isPrint?: boolean;
};

type StructuralVariantsProps = WithLoadingInjectedProps & {
  onDelete?: (rowData: StructuralVariantType) => void;
  variantData: StructuralVariantType[];
  isPrint?: boolean;
};

type ExpressionProps = WithLoadingInjectedProps & {
  onDelete?: (rowData: ExpOutliersType) => void;
  variantData: ExpOutliersType[];
  isPrint?: boolean;
};

const getColumnDefsForLayout = (columnDefs, isPrint = false) => {
  if (!isPrint) {
    return columnDefs;
  }

  const transformColumnDefsForPrint = (defs) => defs
    .filter((colDef) => colDef?.colId !== 'actions' && colDef?.field !== 'actions')
    .map((colDef) => {
      if (Array.isArray(colDef?.children)) {
        return {
          ...colDef,
          children: transformColumnDefsForPrint(colDef.children),
        };
      }

      if (colDef?.cellRenderer === 'GeneCellRenderer') {
        return {
          ...colDef,
          cellRendererParams: {
            ...(colDef.cellRendererParams || {}),
            link: false,
          },
        };
      }

      return colDef;
    });

  return transformColumnDefsForPrint(columnDefs);
};

const getPrintColumnDefs = (columnDefs: Array<ColDef | ColGroupDef>, parentHeaderName = ''): ColDef[] => columnDefs.flatMap((colDef) => {
  const printColDef = colDef as ColDef & {
    children?: Array<ColDef | ColGroupDef>;
    colId?: string;
    field?: string;
  };

  if (printColDef.colId === 'actions' || printColDef.field === 'actions') {
    return [];
  }

  if (Array.isArray(printColDef.children)) {
    const nextParentHeaderName = printColDef.headerName
      ? `${parentHeaderName ? `${parentHeaderName} ` : ''}${printColDef.headerName}`
      : parentHeaderName;
    return getPrintColumnDefs(printColDef.children, nextParentHeaderName);
  }

  const headerName = parentHeaderName
    ? `${parentHeaderName} ${printColDef.headerName || printColDef.field || printColDef.colId || ''}`
    : printColDef.headerName || printColDef.field || printColDef.colId || '';

  return [{
    ...printColDef,
    headerName,
  }];
});

const renderPrintTable = (titleText: string, columnDefs: ColDef[], data: Record<string, unknown>[]) => (
  <>
    <Typography variant="h3" className="data-table__header">
      {titleText}
    </Typography>
    <PrintTable
      columnDefs={getPrintColumnDefs(columnDefs)}
      data={data}
      fullWidth
    />
  </>
);

const GenomicAlterationsTable = ({
  isLoading,
  setIsLoading,
  onDelete,
  variantCategory,
  variantData,
  isPrint = false,
}: GenomicAlterationsTableProps): JSX.Element => {
  switch (variantCategory) {
    case 'smallMutation':
      return <SmallMutations isLoading={isLoading} setIsLoading={setIsLoading} onDelete={onDelete} variantData={variantData as SmallMutationType[]} isPrint={isPrint} />;
    case 'cnv':
      return <CopyNumber isLoading={isLoading} setIsLoading={setIsLoading} onDelete={onDelete} variantData={variantData as CopyNumberType[]} isPrint={isPrint} />;
    case 'structuralVariant':
      return <StructuralVariants isLoading={isLoading} setIsLoading={setIsLoading} onDelete={onDelete} variantData={variantData as StructuralVariantType[]} isPrint={isPrint} />;
    case 'expression':
      return <Expression isLoading={isLoading} setIsLoading={setIsLoading} onDelete={onDelete} variantData={variantData as ExpOutliersType[]} isPrint={isPrint} />;
    default:
      return <></>;
  }
};

const SmallMutations = ({
  isLoading,
  setIsLoading,
  onDelete,
  variantData,
  isPrint = false,
}: SmallMutationsProps): JSX.Element => {

  useEffect(() => {
    if (variantData) {
      setIsLoading(false);
    }
  }, [variantData, setIsLoading]);

  return (
    <div className={`small-mutations ${isPrint ? 'small-mutations--print' : ''}`}>
      {!isLoading && (
        isPrint ? renderPrintTable('Small Mutations', smallMutationsColumnDefs, variantData as Record<string, unknown>[]) : (
          <DataTable
            titleText="Small Mutations"
            columnDefs={getColumnDefsForLayout(smallMutationsColumnDefs, isPrint)}
            rowData={variantData}
            canDelete={!isPrint}
            onDelete={onDelete}
            canToggleColumns={false}
            canExport={!isPrint}
            isPaginated={!isPrint}
            isPrint={isPrint}
          />
        )
      )}
    </div>
  );
};

const CopyNumber = ({
  isLoading,
  setIsLoading,
  onDelete,
  variantData,
  isPrint = false,
}: CopyNumberProps): JSX.Element => {

  useEffect(() => {
    if (variantData) {
      setIsLoading(false);
    }
  }, [variantData, setIsLoading]);

  return (
    <div className={`copy-number ${isPrint ? 'copy-number--print' : ''}`}>
      {!isLoading && (
        isPrint ? renderPrintTable('Copy Number Variants', copyNumberColumnDefs, variantData as Record<string, unknown>[]) : (
          <DataTable
            titleText="Copy Number Variants"
            columnDefs={getColumnDefsForLayout(copyNumberColumnDefs, isPrint)}
            rowData={variantData}
            canDelete={!isPrint}
            onDelete={onDelete}
            canToggleColumns={false}
            canExport={!isPrint}
            isPaginated={!isPrint}
            isPrint={isPrint}
          />
        )
      )}
    </div>
  );
};

const StructuralVariants = ({
  isLoading,
  setIsLoading,
  onDelete,
  variantData,
  isPrint = false,
}: StructuralVariantsProps): JSX.Element => {

  useEffect(() => {
    if (variantData) {
      setIsLoading(false);
    }
  }, [variantData, setIsLoading]);

  return (
    <div className={`structural-variants ${isPrint ? 'structural-variants--print' : ''}`}>
      {!isLoading && (
        isPrint ? renderPrintTable('Structural Variants', structuralVariantsColumnDefs as ColDef[], variantData as Record<string, unknown>[]) : (
          <DataTable
            titleText="Structural Variants"
            columnDefs={getColumnDefsForLayout(structuralVariantsColumnDefs as any, isPrint)}
            rowData={variantData}
            canDelete={!isPrint}
            onDelete={onDelete}
            canToggleColumns={false}
            canExport={!isPrint}
            isPaginated={!isPrint}
            isPrint={isPrint}
          />
        )
      )}
    </div>
  );
};

const Expression = ({
  isLoading,
  setIsLoading,
  onDelete,
  variantData,
  isPrint = false,
}: ExpressionProps): JSX.Element => {

  useEffect(() => {
    if (variantData) {
      setIsLoading(false);
    }
  }, [variantData, setIsLoading]);

  return (
    <div className={`expression-variants ${isPrint ? 'expression-variants--print' : ''}`}>
      {!isLoading && (
        isPrint ? renderPrintTable('Expression Variants', expressionColumnDefs as ColDef[], variantData as Record<string, unknown>[]) : (
          <DataTable
            columnDefs={getColumnDefsForLayout(expressionColumnDefs, isPrint)}
            rowData={variantData}
            titleText="Expression Variants"
            canDelete={!isPrint}
            onDelete={onDelete}
            canToggleColumns={false}
            canExport={!isPrint}
            isPaginated={!isPrint}
            isPrint={isPrint}
          />
        )
      )}
    </div>
  );
};

export default withLoading(GenomicAlterationsTable);
