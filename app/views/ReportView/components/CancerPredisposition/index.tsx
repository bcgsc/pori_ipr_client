import React, { useState, useEffect, useContext } from 'react';

import api from '@/services/api';
import DataTable from '@/components/DataTable';
import ReportContext from '@/context/ReportContext';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import snackbar from '@/services/SnackbarUtils';
import columnDefs from './columnDefs';

type CancerPredispositionProps = WithLoadingInjectedProps;

const CancerPredisposition = ({
  isLoading,
  setIsLoading,
}: CancerPredispositionProps): JSX.Element => {
  const { report } = useContext(ReportContext);

  const [variants, setVariants] = useState();

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const variantsResp = await api.get(
            `/reports/${report.ident}/kb-matches?category=cancer predisposition`,
          ).request();
          setVariants(variantsResp.filter((varObj) => varObj.variant?.germline));
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
          titleText="Known Cancer Predisposition Variants from Targeted Gene Report"
        />
      )}
    </div>
  );
};

export default withLoading(CancerPredisposition);
