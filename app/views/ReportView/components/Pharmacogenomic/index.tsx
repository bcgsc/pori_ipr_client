import React, { useState, useEffect, useContext } from 'react';

import api from '@/services/api';
import DataTable from '@/components/DataTable';
import ReportContext from '@/context/ReportContext';
import { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import snackbar from '@/services/SnackbarUtils';
import columnDefs from './columnDefs';

type PharmacogenomicProps = WithLoadingInjectedProps;

const Pharmacogenomic = ({
  isLoading,
  setIsLoading,
}: PharmacogenomicProps): JSX.Element => {
  const { report } = useContext(ReportContext);

  const [variants, setVariants] = useState();

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const variantsResp = await api.get(
            `/reports/${report.ident}/kb-matches?category=pharmacogenomic`,
          ).request();
          setVariants(variantsResp);
        } catch (err) {
          snackbar.error(`Network error: ${err}`);
        } finally {
          setIsLoading(false);
        }
      };
      getData();
    }
  }, [report, setIsLoading]);

  return (
    <div>
      {!isLoading && (
        <DataTable
          canViewDetails
          columnDefs={columnDefs}
          rowData={variants}
          titleText="Known and Novel Pharmacogenomic Variants"
        />
      )}
    </div>
  );
};

export default Pharmacogenomic;
