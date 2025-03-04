import React, { useState, useEffect, useContext } from 'react';

import api from '@/services/api';
import DataTable from '@/components/DataTable';
import ReportContext from '@/context/ReportContext';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import snackbar from '@/services/SnackbarUtils';
import { KbMatchedStatementType } from '@/common';
import columnDefs from './columnDefs';
import { coalesceEntries } from '../KbMatches/coalesce';

type PharmacogenomicProps = WithLoadingInjectedProps;

const Pharmacogenomic = ({
  isLoading,
  setIsLoading,
}: PharmacogenomicProps): JSX.Element => {
  const { report } = useContext(ReportContext);

  const [variants, setVariants] = useState<KbMatchedStatementType[]>();

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const resp: KbMatchedStatementType[] = await api.get(
            `/reports/${report.ident}/kb-matches/kb-matched-statements`,
          ).request();
          const variantsResp = resp.filter(({ kbData, category }) => kbData?.kbmatchTag === 'pharmacogenomic' || category === 'pharmacogenomic');
          setVariants(coalesceEntries(variantsResp));
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
          titleText="Known Pharmacogenomic Variants from Targeted Gene Report"
        />
      )}
    </div>
  );
};

export default withLoading(Pharmacogenomic);
