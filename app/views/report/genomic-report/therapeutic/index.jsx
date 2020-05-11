import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DataTable from '../../../../components/DataTable';
import EditDialog from './components/EditDialog';
import columnDefs from './columnDefs';
import { therapeuticUpdateTable } from '../../../../services/reports/therapeutic';

/**
 * @param {object} props props
 * @param {bool} props.reportEdit can user edit report?
 * @param {array} props.therapeuticTargets therapeutic and chemoresistance row data
 * @param {bool} props.print is this the print version?
 * @param {report} props.report report object
 * @return {*} JSX
 */
function TherapeuticView(props) {
  const {
    reportEdit,
    therapeuticTargets,
    print,
    report,
  } = props;

  const [therapeuticData] = useState(therapeuticTargets.filter(
    target => target.type === 'therapeutic',
  ));

  const [chemoresistanceData] = useState(therapeuticTargets.filter(
    target => target.type === 'chemoresistance',
  ));

  return (
    <>
      <DataTable
        titleText="Potential Therapeutic Targets"
        columnDefs={columnDefs}
        rowData={therapeuticData}
        canEdit={reportEdit && !print}
        EditDialog={EditDialog}
        canAdd={reportEdit && !print}
        reportIdent={report.ident}
        tableType="therapeutic"
        isPaginated={false}
        canReorder={reportEdit && !print}
        rowUpdateAPICall={therapeuticUpdateTable}
        canExport
      />

      <DataTable
        titleText="Potential Chemoresistance"
        columnDefs={columnDefs}
        rowData={chemoresistanceData}
        canEdit={reportEdit && !print}
        EditDialog={EditDialog}
        canAdd={reportEdit && !print}
        reportIdent={report.ident}
        tableType="chemoresistance"
        isPaginated={false}
        canReorder={reportEdit && !print}
        rowUpdateAPICall={therapeuticUpdateTable}
        canExport
      />
    </>
  );
}

TherapeuticView.propTypes = {
  reportEdit: PropTypes.bool.isRequired,
  therapeuticTargets: PropTypes.arrayOf(PropTypes.object),
  print: PropTypes.bool.isRequired,
  report: PropTypes.objectOf(PropTypes.any).isRequired,
};

TherapeuticView.defaultProps = {
  therapeuticTargets: [],
};

export default TherapeuticView;
