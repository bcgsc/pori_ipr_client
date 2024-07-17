import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import api from '@/services/api';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import snackbar from '@/services/SnackbarUtils';
import searchReportsColumns from '@/utils/searchReportsColumns';
import '../ReportsView/index.scss';
import ReportsTableComponent from '@/components/ReportsTable';
import { Chip, Typography } from '@mui/material';

import './index.scss';

type ReportsByVariantViewProps = WithLoadingInjectedProps;

const ReportsByVariantView = ({
  isLoading,
  setIsLoading,
}: ReportsByVariantViewProps): JSX.Element => {
  const { keyVariant } = useParams<{ keyVariant: string }>();
  const [rowData, setRowData] = useState([]);
  const [variants, setVariants] = useState<string[]>();

  useEffect(() => {
    if (keyVariant) {
      const getData = async () => {
        try {
          const {reports} = await api.get(`/reports?keyVariant=${keyVariant.replace(/%2F/, '.')}`).request();

          setVariants(Array.from(new Set(reports.map((report) => {
            return report.genomicAlterationsIdentified[0].geneVariant;
          }))));

          setRowData(reports.map((report) => {
            const [analyst] = report.users
              .filter((u) => u.role === 'analyst' && !u.deletedAt)
              .map((u) => u.user);

            const [reviewer] = report.users
              .filter((u) => u.role === 'reviewer')
              .map((u) => u.user);

            const [bioinformatician] = report.users
              .filter((u) => u.role === 'bioinformatician')
              .map((u) => u.user);

            if (!report.patientInformation) {
              report.patientInformation = {};
            }

            return (
              searchReportsColumns(report, analyst, reviewer, bioinformatician)
            );
          }));
        } catch (err) {
          snackbar.error(`Network error: ${err}`);
        } finally {
          setIsLoading(false);
        }
      };

      getData();
    }
  }, [keyVariant, setIsLoading]);

  const handleChipDeleted = useCallback((deleteVariant) => {
    try {
      setVariants(variants.filter((variant) => variant !== deleteVariant));
      setRowData(rowData.filter((row) => row.matchedVariant !== deleteVariant));
    } catch (err) {
      snackbar.error('Entry NOT deleted due to an error');
    }
  }, [variants, rowData]);


  if (isLoading) { return null; }

  return (
    <>
      {Boolean(variants.length) && (
        <>
          <Typography variant='h3' className='typography'>
            Matching Variants
          </Typography>
          <div className="variant-chips">
            {variants.map((variant) => (
              <React.Fragment key={variant}>
                <Chip
                  label={`${variant}`}
                  onDelete={() => handleChipDeleted(variant)} />
              </React.Fragment>
            ))}
          </div>
        </>
      )}
      <Typography variant='h3' className='typography'>
        Matching Reports
      </Typography>
      <div className="reports-table">
        <ReportsTableComponent
          rowData={rowData}
          isSearch
        />
      </div>
    </>
  );
};

export default withLoading(ReportsByVariantView);
