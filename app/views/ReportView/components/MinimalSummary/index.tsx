import React, { useEffect, useState, useContext } from 'react';
import {
  Typography,
} from '@material-ui/core';

import api from '@/services/api';
import ReportContext from '@/components/ReportContext';
import PatientInformation from '@/components/PatientInformation';
import DataTable from '@/components/DataTable';
import PrintTable from '@/components/PrintTable';
import { sampleColumnDefs } from './columnDefs';

type MinimalSummaryProps = {
  isPrint?: boolean;
};

const MinimalSummary = ({
  isPrint = false,
}: MinimalSummaryProps): JSX.Element => {
  const { report } = useContext(ReportContext);

  useEffect(() => {
    if (report) {
      const getData = async () => {
        await api.get().request();
      };
      getData();
    }
  }, [report]);

  return (
    <div>
      {report && (
        <>
          <PatientInformation
            isPrint={isPrint}
            patientInfo={report.patientInformation}
          />
          <div className="probe-summary__sample-information">
            <Typography variant="h3" display="inline" className="probe-summary__sample-information-title">
              Sample Information
            </Typography>
            {isPrint ? (
              <PrintTable
                data={report.sampleInfo}
                columnDefs={sampleColumnDefs}
              />
            ) : (
              <DataTable
                columnDefs={sampleColumnDefs}
                rowData={report.sampleInfo}
                isPrint={isPrint}
                isPaginated={!isPrint}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MinimalSummary;
