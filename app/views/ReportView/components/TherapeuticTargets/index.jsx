import React, { useState, useEffect } from 'react';
import { LinearProgress } from '@material-ui/core';
import PropTypes from 'prop-types';
import DataTable from '@/components/DataTable';
import EditDialog from './components/EditDialog';
import columnDefs from './columnDefs';
import { therapeuticUpdateTable, therapeuticGet } from '@/services/reports/therapeutic';

/**
 * @param {object} props props
 * @param {bool} props.canEdit can user edit report?
 * @param {array} props.therapeuticTargets therapeutic and chemoresistance row data
 * @param {bool} props.print is this the print version?
 * @param {report} props.report report object
 * @return {*} JSX
 */
function TherapeuticView(props) {
  const {
    canEdit,
    print,
    report,
  } = props;

  const [therapeuticData, setTherapeuticData] = useState();

  const [chemoresistanceData, setChemoresistanceData] = useState();
  useEffect(() => {
    if (report) {
      const getData = async () => {
        const resp = await therapeuticGet(report.ident);

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

  return (
    <div className="therapeutic">
      {therapeuticData ? (
        <>
          <DataTable
            titleText="Potential Therapeutic Targets"
            columnDefs={columnDefs}
            rowData={therapeuticData}
            canEdit={canEdit && !print}
            EditDialog={EditDialog}
            canAdd={canEdit && !print}
            reportIdent={report.ident}
            tableType="therapeutic"
            isPaginated={false}
            canReorder={canEdit && !print}
            rowUpdateAPICall={therapeuticUpdateTable}
            canExport
            patientId={report.patientId}
            print={print}
          />

          <DataTable
            titleText="Potential Chemoresistance"
            columnDefs={columnDefs}
            rowData={chemoresistanceData}
            canEdit={canEdit && !print}
            EditDialog={EditDialog}
            canAdd={canEdit && !print}
            reportIdent={report.ident}
            tableType="chemoresistance"
            isPaginated={false}
            canReorder={canEdit && !print}
            rowUpdateAPICall={therapeuticUpdateTable}
            canExport
            patientId={report.patientId}
            print={print}
          />
        </>
      ) : (
        <LinearProgress />
      )}
    </div>
  );
}

TherapeuticView.propTypes = {
  canEdit: PropTypes.bool,
  print: PropTypes.bool,
  report: PropTypes.objectOf(PropTypes.any).isRequired,
};

TherapeuticView.defaultProps = {
  canEdit: false,
  print: false,
};

export default TherapeuticView;
