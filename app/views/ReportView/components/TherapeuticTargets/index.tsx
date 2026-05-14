/* eslint-disable no-param-reassign */
import React, {
  useState, useEffect, useContext, useCallback, useMemo, useRef,
} from 'react';
import orderBy from 'lodash/orderBy';
import { MenuItem, Typography } from '@mui/material';
import { cloneDeep } from 'lodash';
import { ColDef } from '@ag-grid-community/core';

import DataTable, { DataTableImperativeHandle } from '@/components/DataTable';
import useReport from '@/hooks/useReport';
import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import DemoDescription from '@/components/DemoDescription';
import ReportContext from '@/context/ReportContext';
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

  const therapeuticTableRef = useRef<DataTableImperativeHandle>(null);
  const chemoresistanceTableRef = useRef<DataTableImperativeHandle>(null);
  const [reorderingTable, setReorderingTable] = useState<null | 'therapeutic' | 'chemoresistance'>(null);

  const toggleReorder = (which: 'therapeutic' | 'chemoresistance') => {
    setReorderingTable((prev) => (prev === which ? null : which));
  };

  useEffect(() => {
    if (!reorderingTable) return;
    const ref = reorderingTable === 'therapeutic' ? therapeuticTableRef : chemoresistanceTableRef;
    ref.current?.getColumnApi()?.applyColumnState({
      state: [{ colId: 'rank', sort: 'asc' }],
      defaultState: { sort: null },
    });
  }, [reorderingTable]);

  const withReorderColDefs = (base: ColDef[], reorder: boolean): ColDef[] => base.map((col) => {
    if (col.colId === 'drag') return { ...col, hide: !reorder };
    if (reorder) return { ...col, sortable: false, filter: false };
    return col;
  });

  const therapeuticColDefs = useMemo(
    () => withReorderColDefs(potentialTherapeuticTargetsColDefs, reorderingTable === 'therapeutic'),
    [reorderingTable],
  );

  const chemoresistanceColDefs = useMemo(
    () => withReorderColDefs(potentialResistanceToxicityColDefs, reorderingTable === 'chemoresistance'),
    [reorderingTable],
  );

  const therapeuticMenuItems = () => (
    <MenuItem onClick={() => toggleReorder('therapeutic')}>
      {reorderingTable === 'therapeutic' ? 'Stop Reordering' : 'Reorder Rows'}
    </MenuItem>
  );

  const chemoresistanceMenuItems = () => (
    <MenuItem onClick={() => toggleReorder('chemoresistance')}>
      {reorderingTable === 'chemoresistance' ? 'Stop Reordering' : 'Reorder Rows'}
    </MenuItem>
  );

  const getData = useCallback(async () => {
    if (report) {
      try {
        setIsLoading(true);
        const therapeuticResp = await api.get(
          `/reports/${report.ident}/therapeutic-targets`,
        ).request();
        const [
          filteredTherapeutic,
          filteredChemoresistance,
        ] = filterType(therapeuticResp, 'therapeutic', 'chemoresistance');
        if (isPrint) {
          setTherapeuticData(removeExtraProps(filteredTherapeutic));
          setChemoresistanceData(removeExtraProps(filteredChemoresistance));
        } else {
          setTherapeuticData(orderRankStartingByZero(filteredTherapeutic));
          setChemoresistanceData(orderRankStartingByZero(filteredChemoresistance));
        }
      } catch (err) {
        snackbar.error(`Network error: ${err}`);
      } finally {
        setIsLoading(false);
      }
    }
  }, [report, setIsLoading, isPrint]);

  useEffect(() => {
    getData();
  }, [getData]);

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
        // Update state to reflect new data after entry deleted
        getData();
      }
    } catch (err) {
      snackbar.error(`Error, row not updated: ${err}`);
    } finally {
      setEditData(null);
    }
  }, [chemoresistanceData, getData, therapeuticData]);

  const handleReorder = useCallback(async (newRow, newRank, tableType) => {
    try {
      let setter: React.Dispatch<React.SetStateAction<TherapeuticDataTableType>>;
      let data: TherapeuticDataTableType;
      const oldRank = newRow.rank;

      if (tableType === 'therapeutic') {
        setter = setTherapeuticData;
        data = cloneDeep(therapeuticData);
      } else {
        setter = setChemoresistanceData;
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
      await api.put(`/reports/${report.ident}/therapeutic-targets`, newData).request();
      setter(newData);
      snackbar.success('Row updated');
    } catch (err) {
      snackbar.error(`Error, row not updated: ${err}`);
    }
  }, [chemoresistanceData, therapeuticData, report]);

  const handleDeleteTherapeuticTarget = useCallback(async (rowNodeData: TherapeuticDataTableType[number]) => {
    const { ident: therapeuticIdent } = rowNodeData;
    try {
      await api.del(`/reports/${report.ident}/therapeutic-targets/${therapeuticIdent}`, {}).request();
      snackbar.success(`Successfully deleted ${therapeuticIdent}`);
      getData();
    } catch (e) {
      snackbar.error('Failed to delete therapeutic option: ', e);
    }
  }, [report.ident, getData]);

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
            columnDefs={therapeuticColDefs}
            canAdd={canEdit}
            canDelete={canEdit}
            canEdit={canEdit}
            canExport
            additionalTableMenuItems={canEdit ? therapeuticMenuItems : null}
            Header={EvidenceHeader}
            isPaginated={false}
            onAdd={handleEditStart}
            onDelete={handleDeleteTherapeuticTarget}
            onEdit={handleEditStart}
            onRowDragEnd={(e) => handleReorder(e.node.data, e.overIndex, 'therapeutic')}
            rowData={therapeuticData}
            tableType="therapeutic"
          />
          <DataTable
            ref={chemoresistanceTableRef}
            titleText="Potential Resistance and Toxicity"
            columnDefs={chemoresistanceColDefs}
            canAdd={canEdit}
            canDelete={canEdit}
            canEdit={canEdit}
            canExport
            additionalTableMenuItems={canEdit ? chemoresistanceMenuItems : null}
            Header={EvidenceHeader}
            isPaginated={false}
            onAdd={handleEditStart}
            onDelete={handleDeleteTherapeuticTarget}
            onEdit={handleEditStart}
            onRowDragEnd={(e) => handleReorder(e.node.data, e.overIndex, 'chemoresistance')}
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
