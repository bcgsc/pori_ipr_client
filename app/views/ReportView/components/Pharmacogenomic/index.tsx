import React, { useState, useEffect, useContext } from 'react';

import api from '@/services/api';
import DataTable from '@/components/DataTable';
import ReportContext from '@/context/ReportContext';
import columnDefs from './columnDefs';

const Pharmacogenomic = (): JSX.Element => {
  const { report } = useContext(ReportContext);

  const [variants, setVariants] = useState();

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
        canViewDetails
        columnDefs={columnDefs}
        rowData={variants}
        titleText="Known and Novel Pharmacogenomic Variants"
      />
    </div>
  );
};

export default Pharmacogenomic;
