import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DataTable from '../../../../components/DataTable';
import EditDialog from './components/EditDialog';
import columnDefs from './ColumnDefs';

/**
 * @param {object} props props
 * @param {bool} props.reportEdit can user edit report?
 * @param {array} props.therapeuticTargets therapeutic and chemoresistance row data
 * @param {bool} props.print is this the print version?
 * @return {*} JSX
 */
function TherapeuticView(props) {
  const {
    reportEdit,
    therapeuticTargets,
    print,
  } = props;

  const [therapeuticData, setTherapeuticData] = useState(therapeuticTargets.filter(
    target => target.type === 'therapeutic',
  ));

  const [chemoresistanceData, setChemoresistanceData] = useState(therapeuticTargets.filter(
    target => target.type === 'chemoresistance',
  ));

  return (
    <>
      <DataTable
        title="Potential Therapeutic Targets"
        columnDefs={columnDefs}
        rowData={therapeuticData}
        editable={reportEdit && !print}
        EditDialog={EditDialog}
        addable={reportEdit && !print}
      />

      <DataTable
        title="Potential Chemoresistance"
        columnDefs={columnDefs}
        rowData={chemoresistanceData}
        editable={reportEdit && !print}
        EditDialog={EditDialog}
        addable={reportEdit && !print}
      />
    </>
  );
}

TherapeuticView.propTypes = {
  reportEdit: PropTypes.bool.isRequired,
  therapeuticTargets: PropTypes.arrayOf(PropTypes.object),
  print: PropTypes.bool.isRequired,
};

TherapeuticView.defaultProps = {
  therapeuticTargets: [],
};

export default TherapeuticView;
