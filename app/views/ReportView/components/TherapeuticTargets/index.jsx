import React, {
  useState, useEffect, useContext, useCallback,
} from 'react';
import { LinearProgress } from '@material-ui/core';
import PropTypes from 'prop-types';
import orderBy from 'lodash.orderby';

import DataTable from '@/components/DataTable';
import EditContext from '@/components/EditContext';
import ReportContext from '../../../../components/ReportContext';
import EditDialog from './components/EditDialog';
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
const TherapeuticView = (props) => {
  const {
    print,
  } = props;

  const [therapeuticData, setTherapeuticData] = useState();
  const [chemoresistanceData, setChemoresistanceData] = useState();

  const [showDialog, setShowDialog] = useState(false);
  const [editData, setEditData] = useState();

  const { canEdit } = useContext(EditContext);
  const { report } = useContext(ReportContext);

  useEffect(() => {
    if (report) {
      const getData = async () => {
        const call = api.get(`/reports/${report.ident}/therapeutic-targets`);
        const resp = await call.request();

        setTherapeuticData(resp.filter(
          target => target.type === 'therapeutic',
        ));
        setChemoresistanceData(resp.filter(
          target => target.type === 'chemoresistance',
        ));
      };

      getData();
    }
  }, [report]);

  const handleEditStart = (rowData) => {
    setShowDialog(true);
    if (rowData) {
      setEditData(rowData);
    }
  };

  const handleEditClose = useCallback((newData) => {
    setShowDialog(false);
    if (newData) {
      if (newData.type === 'therapeutic') {
        const therapeuticIndex = therapeuticData.findIndex(row => row.ident === newData.ident);
        if (therapeuticIndex !== -1) {
          const newTherapeutic = [...orderBy(therapeuticData, ['rank'], ['asc'])];
          newTherapeutic[therapeuticIndex] = newData;
          setTherapeuticData(newTherapeutic);
        } else {
          setTherapeuticData(prevVal => [...prevVal, newData]);
        }
      }
      if (newData.type === 'chemoresistance') {
        const chemoresistanceIndex = chemoresistanceData.findIndex(row => row.ident === newData.ident);
        if (chemoresistanceIndex !== -1) {
          const newChemoresistance = [...orderBy(chemoresistanceData, ['rank'], ['asc'])];
          newChemoresistance[chemoresistanceIndex] = newData;
          setChemoresistanceData(newChemoresistance);
        } else {
          setChemoresistanceData(prevVal => [...prevVal, newData]);
        }
      }
    }
    setEditData(null);
  }, [chemoresistanceData, therapeuticData]);

  return (
    <div className="therapeutic">
      {therapeuticData ? (
        <>
          <DataTable
            titleText="Potential Therapeutic Targets"
            columnDefs={columnDefs}
            rowData={therapeuticData}
            canEdit={canEdit && !print}
            onEdit={handleEditStart}
            canAdd={canEdit && !print}
            onAdd={handleEditStart}
            reportIdent={report.ident}
            tableType="therapeutic"
            isPaginated={false}
            canReorder={canEdit && !print}
            rowUpdateAPICall={(reportIdent, data) => api.put(`/reports/${reportIdent}/therapeutic-targets`, data)}
            canExport
            patientId={report.patientId}
            print={print}
          />
          <DataTable
            titleText="Potential Chemoresistance"
            columnDefs={columnDefs}
            rowData={chemoresistanceData}
            canEdit={canEdit && !print}
            onEdit={handleEditStart}
            canAdd={canEdit && !print}
            onAdd={handleEditStart}
            reportIdent={report.ident}
            tableType="chemoresistance"
            isPaginated={false}
            canReorder={canEdit && !print}
            rowUpdateAPICall={(reportIdent, data) => api.put(`/reports/${reportIdent}/therapeutic-targets`, data)}
            canExport
            patientId={report.patientId}
            print={print}
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
      ) : (
        <LinearProgress />
      )}
    </div>
  );
};

TherapeuticView.propTypes = {
  print: PropTypes.bool,
};

TherapeuticView.defaultProps = {
  print: false,
};

export default TherapeuticView;
