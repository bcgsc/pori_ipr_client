import React, { useState, useEffect, useContext } from 'react';
import {
  Typography,
} from '@material-ui/core';

import api from '@/services/api';
import DataTable from '@/components/DataTable';
import ReportContext from '@/components/ReportContext';
import { columnDefs } from '../KbMatches/columnDefs';

const Pharmacogenomic = (): JSX.Element => {
  const { report } = useContext(ReportContext);

  const [variants, setVariants] = useState([]);

  useEffect(() => {
    if (report) {
      const getData = async () => {
        const variantsResp = await api.get(
          `/reports/${report.ident}/kb-matches?category=pharmacogenomic`,
          {},
        ).request();
        setVariants(variantsResp);
      };
      getData();
    }
  }, [report]);

  return (
    <div>
      <DataTable
        rowData={variants}
        columnDefs={columnDefs}
      />
    </div>
  );
};

export default Pharmacogenomic;
