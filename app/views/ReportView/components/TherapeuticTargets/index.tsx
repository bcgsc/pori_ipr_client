import React, {
  useState, useEffect, useContext, useCallback,
} from 'react';
import orderBy from 'lodash.orderby';
import { Typography } from '@mui/material';

import DataTable from '@/components/DataTable';
import useEdit from '@/hooks/useEdit';
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

const removeExtraProps = (data: TherapeuticType[]): Partial<TherapeuticType>[] => data.map(({
  gene, variant, therapy, context, evidenceLevel, notes,
}) => ({
  gene,
  variant,
  therapy,
  context,
  evidenceLevel,
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
} & WithLoadingInjectedProps;

const Therapeutic = ({
  isLoading,
  isPrint = false,
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
  const [editData, setEditData] = useState();

  const { canEdit } = useEdit();
  const { report } = useContext(ReportContext);

  useEffect(() => {
    if (report) {
      const getData = async () => {
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
            setTherapeuticData(filteredTherapeutic);
            setChemoresistanceData(filteredChemoresistance);
          }
        } catch (err) {
          snackbar.error(`Network error: ${err}`);
        } finally {
          setIsLoading(false);
        }
      };

      getData();
    }
  }, [report, setIsLoading, isPrint]);

  const handleEditStart = (rowData) => {
    setShowDialog(true);
    setEditData(rowData);
  };

  const handleEditClose = useCallback((newData) => {
    try {
      setShowDialog(false);
      let tableData: TherapeuticType[] | Partial<TherapeuticType>[];
      let setter: React.Dispatch<React.SetStateAction<TherapeuticType[]>>;

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
    } catch (err) {
      snackbar.error(`Error, row not updated: ${err}`);
    }
  }, [chemoresistanceData, therapeuticData]);

  const handleReorder = useCallback(async (newRow, newRank, tableType) => {
    try {
      let setter: React.Dispatch<React.SetStateAction<TherapeuticType[] | Partial<TherapeuticType>[]>>;
      let data: TherapeuticType[] | Partial<TherapeuticType>[];
      const oldRank = newRow.rank;

      if (tableType === 'therapeutic') {
        setter = setTherapeuticData;
        data = therapeuticData;
      } else {
        setter = setChemoresistanceData;
        data = chemoresistanceData;
      }

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

      await api.put(`/reports/${report.ident}/therapeutic-targets`, newData).request();
      setter(newData);
      snackbar.success('Row updated');
    } catch (err) {
      snackbar.error(`Error, row not updated: ${err}`);
    }
  }, [chemoresistanceData, therapeuticData, report]);

  if (isPrint) {
    return (
      <div>
        <Typography
          className="therapeutic-print__title"
          variant="h3"
        >
          Potential Therapeutic Targets
        </Typography>
        <PrintTable
          data={therapeuticData}
          columnDefs={columnDefs}
        />
        <Typography
          className="therapeutic-print__title"
          variant="h3"
        >
          Potential Chemoresistance
        </Typography>
        <PrintTable
          data={chemoresistanceData}
          columnDefs={columnDefs}
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
            titleText="Potential Chemoresistance"
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
