import React, {
  useState, useEffect, useContext, useCallback,
} from 'react';
import { LinearProgress } from '@material-ui/core';
import PropTypes from 'prop-types';
import orderBy from 'lodash.orderby';
import { useSnackbar } from 'notistack';

import DataTable from '@/components/DataTable';
import EditContext from '@/components/EditContext';
import ReportContext from '../../../../components/ReportContext';
import EditDialog from './components/EditDialog';
import EvidenceHeader from './components/EvidenceHeader';
import columnDefs from './columnDefs';
import api from '@/services/api';

/**
 * @param {object} props props
 * @param {bool} props.canEdit can user edit report?
 * @param {array} props.therapeuticTargets therapeutic and chemoresistance row data
 * @param {bool} props.print is this the print version?
 * @param {report} props.report report object
 * @return {*} JSX
 */
const Therapeutic = (props) => {
  const {
    print,
  } = props;

  const [therapeuticData, setTherapeuticData] = useState([]);
  const [chemoresistanceData, setChemoresistanceData] = useState([]);

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [editData, setEditData] = useState();
  const [loading, setLoading] = useState<boolean>(true);

  const { canEdit } = useContext(EditContext);
  const { report } = useContext(ReportContext);
  const snackbar = useSnackbar();

  useEffect(() => {
    if (report) {
      const getData = async () => {
        const therapeuticResp = await api.get(`/reports/${report.ident}/therapeutic-targets`).request();

        setTherapeuticData(therapeuticResp.filter(
          target => target.type === 'therapeutic',
        ));
        setChemoresistanceData(therapeuticResp.filter(
          target => target.type === 'chemoresistance',
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
        const tableIndex = tableData.findIndex(row => row.ident === newData.ident);
        if (tableIndex !== -1) {
          const newTable = [...orderBy(tableData, ['rank'], ['asc'])];
          newTable[tableIndex] = newData;
          setter(newTable);
        } else {
          setter(prevVal => [...prevVal, newData]);
        }
      }
      setEditData(null);
      snackbar.enqueueSnackbar('Row updated');
    } catch (err) {
      snackbar.enqueueSnackbar(`Error, row not updated: ${err}`);
    }
  }, [chemoresistanceData, snackbar, therapeuticData]);

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

      await api.put(`/reports/${report.ident}/therapeutic-targets`, newData).request();
      setter(newData);
      snackbar.enqueueSnackbar('Row updated');
    } catch (err) {
      snackbar.enqueueSnackbar(`Error, row not updated: ${err}`);
    }
  }, [chemoresistanceData, therapeuticData, report, snackbar]);

  return (
    <div className="therapeutic">
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
            print={print}
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
            print={print}
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

Therapeutic.propTypes = {
  print: PropTypes.bool,
};

Therapeutic.defaultProps = {
  print: false,
};

export default Therapeutic;
