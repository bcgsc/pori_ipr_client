/* eslint-disable no-param-reassign */
import React, {
  useState, useEffect, useContext, useCallback,
} from 'react';
import orderBy from 'lodash/orderBy';
import { Typography } from '@mui/material';
import { cloneDeep } from 'lodash';

import DataTable from '@/components/DataTable';
import useReport from '@/hooks/useReport';
import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import DemoDescription from '@/components/DemoDescription';
import ReportContext from '@/context/ReportContext';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import PrintTable from '@/components/PrintTable';
import EditDialog from './components/EditDialog';
import EvidenceHeader from './components/EvidenceHeader';
import columnDefs from './columnDefs';
import TherapeuticType from './types';

import './index.scss';

// Sort by existing rank ascending, then reassign rank based on 0 index, 1 per step
const orderRankStartingByZero = (data: { rank: number }[]) => data.sort((a, b) => a.rank - b.rank)
  .map((nextData, idx) => {
    nextData.rank = idx;
    return nextData;
  });

const removeExtraProps = (data: TherapeuticType[]): Partial<TherapeuticType>[] => data.map(({
  gene, variant, therapy, context, evidenceLevel, iprEvidenceLevel, notes,
}) => ({
  gene,
  variant,
  therapy,
  context,
  evidenceLevel,
  iprEvidenceLevel,
  notes,
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
  ] = useState<TherapeuticType[] | Partial<TherapeuticType>[]>([]);
  const [
    chemoresistanceData,
    setChemoresistanceData,
  ] = useState<TherapeuticType[] | Partial<TherapeuticType>[]>([]);

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [editData, setEditData] = useState<TherapeuticType>({
    ident: null,
    createdAt: null,
    updatedAt: null,
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

  const getData = useCallback(async () => {
    if (report) {
      try {
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
      let tableData: TherapeuticType[] | Partial<TherapeuticType>[];
      let setter: React.Dispatch<React.SetStateAction<TherapeuticType[] | Partial<TherapeuticType>[]>>;
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
      }
      setEditData(null);

      // Update state to reflect new data after entry deleted
      getData();
    } catch (err) {
      snackbar.error(`Error, row not updated: ${err}`);
    }
  }, [chemoresistanceData, getData, therapeuticData]);

  const handleReorder = useCallback(async (newRow, newRank, tableType) => {
    try {
      let setter: React.Dispatch<React.SetStateAction<TherapeuticType[] | Partial<TherapeuticType>[]>>;
      let data: TherapeuticType[] | Partial<TherapeuticType>[];
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

  if (isPrint && printVersion === 'standardLayout') {
    return (
      <div className="therapeutic-print">
        <Typography
          className="therapeutic-print__title"
          variant="h3"
        >
          Potential Therapeutic Targets
        </Typography>
        <PrintTable
          fullWidth
          data={therapeuticData}
          columnDefs={columnDefs}
          collapseableCols={['gene', 'variant']}
          orderByInternalCol="evidenceLevel"
          orderByInternalColBackup="therapy"
        />
        <Typography
          className="therapeutic-print__title"
          variant="h3"
        >
          Potential Resistance and Toxicity
        </Typography>
        <PrintTable
          fullWidth
          data={chemoresistanceData}
          columnDefs={columnDefs}
          collapseableCols={['gene', 'variant']}
          orderByInternalCol="evidenceLevel"
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
        <PrintTable
          fullWidth
          data={therapeuticData}
          columnDefs={columnDefs}
          collapseableCols={['gene', 'variant']}
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
        <PrintTable
          fullWidth
          data={chemoresistanceData}
          columnDefs={columnDefs}
          collapseableCols={['gene', 'variant']}
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
            titleText="Potential Therapeutic Targets"
            columnDefs={columnDefs}
            rowData={therapeuticData}
            canEdit={canEdit}
            onEdit={handleEditStart}
            canAdd={canEdit}
            onAdd={handleEditStart}
            tableType="therapeutic"
            isPaginated={false}
            canReorder={canEdit}
            onReorder={handleReorder}
            canExport
            Header={EvidenceHeader}
          />
          <DataTable
            titleText="Potential Resistance and Toxicity"
            columnDefs={columnDefs}
            rowData={chemoresistanceData}
            canEdit={canEdit}
            onEdit={handleEditStart}
            canAdd={canEdit}
            onAdd={handleEditStart}
            tableType="chemoresistance"
            isPaginated={false}
            canReorder={canEdit}
            canExport
            Header={EvidenceHeader}
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
