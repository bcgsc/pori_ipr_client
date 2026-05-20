/* eslint-disable no-param-reassign */
import React, {
  useState, useEffect, useContext, useCallback, useRef,
} from 'react';
import orderBy from 'lodash/orderBy';
import { Typography } from '@mui/material';
import { cloneDeep } from 'lodash';

import DataTable, { DataTableImperativeHandle } from '@/components/DataTable';
import useReport from '@/hooks/useReport';
import { useReportTherapeuticTargets } from '@/queries/get';
import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import DemoDescription from '@/components/DemoDescription';
import ReportContext from '@/context/ReportContext';
import ConfirmContext from '@/context/ConfirmContext';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import EditDialog from './components/EditDialog';
import EvidenceHeader from './components/EvidenceHeader';
import {
  potentialTherapeuticTargetsColDefs,
  potentialResistanceToxicityColDefs,
} from './columnDefs';

import './index.scss';
import TherapeuticTargetPrintTable from './components/TherapeuticTargetPrintTable';
import { TherapeuticDataTableType, TherapeuticType } from './types';

// Sort by existing rank ascending, then reassign rank based on 0 index, 1 per step
const orderRankStartingByZero = (data: { rank: number }[]) => data.sort((a, b) => a.rank - b.rank)
  .map((nextData, idx) => {
    nextData.rank = idx;
    return nextData;
  });

const removeExtraProps = (data: TherapeuticType[]): Partial<TherapeuticType>[] => data.map(({
  gene, variant, therapy, context, evidenceLevel, iprEvidenceLevel, notes, signature, rank,
}) => ({
  gene,
  variant,
  therapy,
  context,
  evidenceLevel,
  iprEvidenceLevel,
  notes,
  signature,
  rank,
}));

const filterType = (
  data: TherapeuticType[],
  type1: string,
  type2: string,
): [TherapeuticType[], TherapeuticType[]] => data.reduce((accumulator, current) => {
  if (current.type === type1) {
    accumulator[0].push(current);
  }
  if (current.type === type2) {
    accumulator[1].push(current);
  }
  return accumulator;
}, [[], []]);

type TherapeuticProps = {
  isPrint?: boolean;
  printVersion?: 'standardLayout' | 'condensedLayout' | null;
} & WithLoadingInjectedProps;

const Therapeutic = ({
  isLoading,
  isPrint = false,
  printVersion = null,
  setIsLoading,
}: TherapeuticProps): JSX.Element => {
  const [
    therapeuticData,
    setTherapeuticData,
  ] = useState<TherapeuticDataTableType>([]);
  const [
    chemoresistanceData,
    setChemoresistanceData,
  ] = useState<TherapeuticDataTableType>([]);

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [editData, setEditData] = useState<TherapeuticType>({
    ident: null,
    createdAt: null,
    updatedAt: null,
    deletedAt: null,
    type: null,
    rank: null,
    gene: null,
    geneGraphkbId: null,
    variant: null,
    variantGraphkbId: null,
    signature: null,
    signatureGraphkbId: null,
    therapy: null,
    therapyGraphkbId: null,
    context: null,
    contextGraphkbId: null,
    evidenceLevel: null,
    iprEvidenceLevel: null,
    evidenceLevelGraphkbId: null,
    kbStatementIds: null,
    notes: null,
  });

  const { canEdit } = useReport();
  const { report } = useContext(ReportContext);
  const { isSigned } = useContext(ConfirmContext);
  const { showConfirmDialog } = useConfirmDialog();

  const therapeuticTableRef = useRef<DataTableImperativeHandle>(null);
  const chemoresistanceTableRef = useRef<DataTableImperativeHandle>(null);

  const {
    data: therapeuticTargets,
    isLoading: isQueryLoading,
    isFetching: isTherapeuticTargetsFetching,
    refetch: refetchTherapeuticTargets,
  } = useReportTherapeuticTargets<TherapeuticType[]>(
    report?.ident,
    {
      enabled: Boolean(report?.ident),
      onError: (err) => {
        snackbar.error(`Network error: ${err}`);
      },
    },
  );

  useEffect(() => {
    setIsLoading(isQueryLoading);
  }, [isQueryLoading, setIsLoading]);

  // Drive each DataTable's built-in loading overlay during refetches: AG Grid
  // covers the row area and suppresses drag while the overlay is shown, so the
  // user can't act on stale rows. The toolbar Add button stays clickable, but
  // it only opens an empty dialog for a new row — not dangerous to leave open.
  useEffect(() => {
    if (isTherapeuticTargetsFetching) {
      therapeuticTableRef.current?.showLoading();
      chemoresistanceTableRef.current?.showLoading();
    } else {
      therapeuticTableRef.current?.hideLoading();
      chemoresistanceTableRef.current?.hideLoading();
    }
  }, [isTherapeuticTargetsFetching]);

  useEffect(() => {
    if (!therapeuticTargets) { return; }
    // Clone so the in-place rank reassignment below never mutates the query cache.
    const [
      filteredTherapeutic,
      filteredChemoresistance,
    ] = filterType(cloneDeep(therapeuticTargets), 'therapeutic', 'chemoresistance');
    if (isPrint) {
      setTherapeuticData(removeExtraProps(filteredTherapeutic));
      setChemoresistanceData(removeExtraProps(filteredChemoresistance));
    } else {
      setTherapeuticData(orderRankStartingByZero(filteredTherapeutic));
      setChemoresistanceData(orderRankStartingByZero(filteredChemoresistance));
    }
  }, [therapeuticTargets, isPrint]);

  const handleEditStart = (rowData) => {
    setShowDialog(true);
    setEditData(rowData);
  };

  const handleEditClose = useCallback((newData) => {
    try {
      setShowDialog(false);
      let tableData: TherapeuticDataTableType;
      let setter: React.Dispatch<React.SetStateAction<TherapeuticDataTableType>>;
      if (newData) {
        if (newData.type === 'therapeutic') {
          tableData = therapeuticData;
          setter = setTherapeuticData;
        } else if (newData.type === 'chemoresistance') {
          tableData = chemoresistanceData;
          setter = setChemoresistanceData;
        }
        const tableIndex = tableData.findIndex((row) => row.ident === newData.ident);
        if (tableIndex !== -1) {
          const newTable = [...orderBy(tableData, ['rank'], ['asc'])];
          newTable[tableIndex] = newData;
          setter(newTable);
        } else {
          setter((prevVal) => [...prevVal, newData]);
        }
        snackbar.success('Row updated');
        // Resync with the server (rank normalization, deleted entries, etc.).
        refetchTherapeuticTargets();
      }
    } catch (err) {
      snackbar.error(`Error, row not updated: ${err}`);
    } finally {
      setEditData(null);
    }
  }, [chemoresistanceData, refetchTherapeuticTargets, therapeuticData]);

  const handleReorder = useCallback(async (newRow, newRank, tableType) => {
    try {
      let data: TherapeuticDataTableType;
      const oldRank = newRow.rank;

      if (tableType === 'therapeutic') {
        data = cloneDeep(therapeuticData);
      } else {
        data = cloneDeep(chemoresistanceData);
      }

      // For datafixes on the front-end, bugs introduced due to data inconsistencies between indexed by 0 or 1
      // This forces indexed by 0
      data = data.sort((a, b) => a.rank - b.rank).map((row, idx) => {
        row.rank = idx;
        return row;
      });

      const newData = data.map((row) => {
        if (row.rank === oldRank) {
          row.rank = newRank;
          return row;
        }

        if (row.rank > oldRank && row.rank <= newRank) {
          row.rank -= 1;
        } else if (row.rank < oldRank && row.rank >= newRank) {
          row.rank += 1;
        }
        return row;
      });

      // @ts-expect-error - specialized data object vs a general API call
      const reorderCall = api.put(`/reports/${report.ident}/therapeutic-targets`, newData);

      // Show the loading overlay immediately so the user can't act on the
      // table while the PUT (and follow-up refetch) is in flight. We await the
      // refetch so `finally` runs only after the table state is settled — that
      // way the isFetching effect has already hidden the overlay and the
      // explicit hideLoading() below is just a safety net (also handles the
      // error path, where isFetching never flips).
      if (isSigned) {
        // Persisting this change clears the report signatures; confirm first.
        // The hook shows the success snackbar and resets signature state; on
        // cancel the state is left untouched so the dragged row snaps back.
        const confirmed = await showConfirmDialog(reorderCall, true, 'Row updated');
        if (confirmed) {
          therapeuticTableRef.current?.showLoading();
          chemoresistanceTableRef.current?.showLoading();
          await refetchTherapeuticTargets();
        }
      } else {
        therapeuticTableRef.current?.showLoading();
        chemoresistanceTableRef.current?.showLoading();
        await reorderCall.request();
        snackbar.success('Row updated');
        await refetchTherapeuticTargets();
      }
    } catch (err) {
      snackbar.error(`Error, row not updated: ${err}`);
    } finally {
      therapeuticTableRef.current?.hideLoading();
      chemoresistanceTableRef.current?.hideLoading();
    }
  }, [chemoresistanceData, therapeuticData, report, isSigned, showConfirmDialog, refetchTherapeuticTargets]);

  const handleDeleteTherapeuticTarget = useCallback(async (rowNodeData: TherapeuticDataTableType[number]) => {
    const { ident: therapeuticIdent } = rowNodeData;
    try {
      await api.del(`/reports/${report.ident}/therapeutic-targets/${therapeuticIdent}`, {}).request();
      snackbar.success(`Successfully deleted ${therapeuticIdent}`);
      refetchTherapeuticTargets();
    } catch (e) {
      snackbar.error('Failed to delete therapeutic option: ', e);
    }
  }, [report.ident, refetchTherapeuticTargets]);

  if (isPrint && printVersion === 'standardLayout') {
    return (
      <div className="therapeutic-print">
        <Typography
          className="therapeutic-print__title"
          variant="h3"
        >
          Potential Therapeutic Targets
        </Typography>
        <TherapeuticTargetPrintTable
          columnDefs={potentialTherapeuticTargetsColDefs}
          data={therapeuticData}
          coalesce={['gene', 'variant']}
        />
        <Typography
          className="therapeutic-print__title"
          variant="h3"
        >
          Potential Resistance and Toxicity
        </Typography>
        <TherapeuticTargetPrintTable
          columnDefs={potentialResistanceToxicityColDefs}
          data={chemoresistanceData}
          coalesce={['gene', 'variant']}
        />
      </div>
    );
  }

  if (isPrint && printVersion === 'condensedLayout') {
    return (
      <div className="therapeutic-print">
        <Typography
          className="therapeutic-print__title"
          fontWeight="bold"
          variant="h5"
          display="inline"
        >
          Potential Therapeutic Targets
        </Typography>
        <TherapeuticTargetPrintTable
          columnDefs={potentialTherapeuticTargetsColDefs}
          data={therapeuticData}
          coalesce={['gene', 'variant']}
        />
        <br />
        <Typography
          className="therapeutic-print__title"
          fontWeight="bold"
          variant="h5"
          display="inline"
        >
          Potential Resistance and Toxicity
        </Typography>
        <TherapeuticTargetPrintTable
          columnDefs={potentialResistanceToxicityColDefs}
          data={chemoresistanceData}
          coalesce={['gene', 'variant']}
        />
      </div>
    );
  }

  return (
    <div className="therapeutic">
      <DemoDescription>
        Tumour alterations are reviewed and those representing the most likely potential therapeutic
        targets are highlighted, with details on the associated therapy or general drug class, level
        of evidence, and any relevant clinical trials. Potential caveats are also specified.
        Alterations associated with potential resistance to relevant therapies are also documented.
      </DemoDescription>
      {!isLoading && (
        <>
          <DataTable
            ref={therapeuticTableRef}
            titleText="Potential Therapeutic Targets"
            columnDefs={potentialTherapeuticTargetsColDefs}
            canAdd={canEdit}
            canDelete={canEdit}
            canEdit={canEdit}
            canExport
            canReorder={canEdit}
            Header={EvidenceHeader}
            isPaginated={false}
            onAdd={handleEditStart}
            onDelete={handleDeleteTherapeuticTarget}
            onEdit={handleEditStart}
            onReorder={handleReorder}
            rowData={therapeuticData}
            tableType="therapeutic"
          />
          <DataTable
            ref={chemoresistanceTableRef}
            titleText="Potential Resistance and Toxicity"
            columnDefs={potentialResistanceToxicityColDefs}
            canAdd={canEdit}
            canDelete={canEdit}
            canEdit={canEdit}
            canExport
            canReorder={canEdit}
            Header={EvidenceHeader}
            isPaginated={false}
            onAdd={handleEditStart}
            onDelete={handleDeleteTherapeuticTarget}
            onEdit={handleEditStart}
            onReorder={handleReorder}
            rowData={chemoresistanceData}
            tableType="chemoresistance"
          />
          {showDialog && (
            <EditDialog
              isOpen={showDialog}
              onClose={handleEditClose}
              editData={editData}
              tableType={editData.type}
            />
          )}
        </>
      )}
    </div>
  );
};

export default withLoading(Therapeutic);
