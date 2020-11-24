import React, { useState, useEffect, useContext } from 'react';
import {
  Typography,
} from '@material-ui/core';

import api, { ApiCallSet } from '../../../../services/api';
import DataTable from '../../../../components/DataTable';
import ReportContext from '../../../../components/ReportContext';
import { appendicesType, tcgaType } from './types';
import { sampleInformationColumnDefs, sequencingProtocolInformationColumnDefs, tcgaAcronymsColumnDefs } from './columnDefs';

const Appendices = (): JSX.Element => {
  const { report } = useContext(ReportContext);

  const [appendices, setAppendices] = useState<appendicesType>();
  const [tcga, setTcga] = useState<tcgaType[]>([]);

  useEffect(() => {
    if (report) {
      const getData = async () => {
        const callSet = new ApiCallSet([
          api.get(`/reports/${report.ident}/appendices`, {}),
          api.get(`/reports/${report.ident}/appendices/tcga`, {}),
        ]);
        const [appendicesResp, tcgaResp] = await callSet.request();

        setAppendices(appendicesResp);
        setTcga(tcgaResp);
      };

      getData();
    }
  }, [report]);

  return (
    <div>
      <Typography variant="h1">
        Appendix A
      </Typography>
      {appendices?.sampleInfo && (
        <DataTable
          columnDefs={sampleInformationColumnDefs}
          rowData={appendices.sampleInfo}
          titleText="Sample Information"
        />
      )}
      {appendices?.seqQC && (
        <DataTable
          columnDefs={sequencingProtocolInformationColumnDefs}
          rowData={appendices.seqQC}
          titleText="Sequencing Protocol Information"
        />
      )}
      <Typography variant="h1">
        Appendix B
      </Typography>
      {Boolean(tcga.length) && (
        <DataTable
          columnDefs={tcgaAcronymsColumnDefs}
          rowData={tcga}
          titleText="TCGA Acronyms"
        />
      )}
    </div>
  );
};

export default Appendices;
