import React, {
  useState, useEffect, useContext, useCallback,
} from 'react';
import { LinearProgress } from '@material-ui/core';
import orderBy from 'lodash.orderby';

import DataTable from '@/components/DataTable';
import useEdit from '@/hooks/useEdit';
import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import DemoDescription from '@/components/DemoDescription';
import ReportContext from '@/context/ReportContext';
import EditDialog from './components/EditDialog';
import EvidenceHeader from './components/EvidenceHeader';
import columnDefs from './columnDefs';

type TherapeuticProps = {
  print?: boolean;
};

const Therapeutic = ({
  print = false,
}: TherapeuticProps): JSX.Element => {
  const [therapeuticData, setTherapeuticData] = useState([]);
  const [chemoresistanceData, setChemoresistanceData] = useState([]);

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [editData, setEditData] = useState();
  const [loading, setLoading] = useState<boolean>(true);

  const { canEdit } = useEdit();
  const { report } = useContext(ReportContext);

  useEffect(() => {
    if (report) {
      const getData = async () => {
        const therapeuticResp = await api.get(
          `/reports/${report.ident}/therapeutic-targets`,
          {},
        ).request();

        setTherapeuticData(therapeuticResp.filter(
          (target) => target.type === 'therapeutic',
        ));
        setChemoresistanceData(therapeuticResp.filter(
          (target) => target.type === 'chemoresistance',
        ));
        setLoading(false);
      };

      getData();
    }
  }, [report]);

  const handleEditStart = (rowData) => {
    setShowDialog(true);
    setEditData(rowData);
  };

  const handleEditClose = useCallback((newData) => {
    try {
      setShowDialog(false);
      let tableData;
      let setter;

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
      let setter;
      let data;
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

      await api.put(`/reports/${report.ident}/therapeutic-targets`, newData, {}).request();
      setter(newData);
      snackbar.success('Row updated');
    } catch (err) {
      snackbar.error(`Error, row not updated: ${err}`);
    }
  }, [chemoresistanceData, therapeuticData, report]);

  return (
    <div className="therapeutic">
      <DemoDescription>
        Tumour alterations are reviewed and those representing the most likely potential therapeutic
        targets are highlighted, with details on the associated therapy or general drug class, level
        of evidence, and any relevant clinical trials. Potential caveats are also specified.
        Alterations associated with potential resistance to relevant therapies are also documented.
      </DemoDescription>
      {!loading && (
        <>
          <DataTable
            titleText="Potential Therapeutic Targets"
            columnDefs={columnDefs}
            rowData={therapeuticData}
            canEdit={canEdit && !print}
            onEdit={handleEditStart}
            canAdd={canEdit && !print}
            onAdd={handleEditStart}
            tableType="therapeutic"
            isPaginated={false}
            canReorder={canEdit && !print}
            onReorder={handleReorder}
            canExport
            isPrint={print}
            Header={EvidenceHeader}
          />
          <DataTable
            titleText="Potential Chemoresistance"
            columnDefs={columnDefs}
            rowData={chemoresistanceData}
            canEdit={canEdit && !print}
            onEdit={handleEditStart}
            canAdd={canEdit && !print}
            onAdd={handleEditStart}
            tableType="chemoresistance"
            isPaginated={false}
            canReorder={canEdit && !print}
            canExport
            isPrint={print}
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
      {loading && (
        <LinearProgress />
      )}
    </div>
  );
};

export default Therapeutic;
