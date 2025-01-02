import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Chip, Typography } from '@mui/material';
import api from '@/services/api';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import snackbar from '@/services/SnackbarUtils';
import DataTable from '@/components/DataTable';
import searchReportsColumns from '@/utils/searchReportsColumns';
import searchColumnDefs from '@/components/ReportsTable/searchColumnDefs';

import '../ReportsView/index.scss';
import './index.scss';

type ReportsByVariantViewProps = WithLoadingInjectedProps;

const ReportsByVariantView = ({
  isLoading,
  setIsLoading,
}: ReportsByVariantViewProps): JSX.Element => {
  const { search } = useLocation();
  const [rowData, setRowData] = useState([]);
  const [tempRowData, setTempRowData] = useState([]);
  const [variants, setVariants] = useState<string[]>();
  const [chipSelected, setChipSelected] = useState('');

  useEffect(() => {
    if (search) {
      const getData = async () => {
        try {
          const { reports } = await api.get(`/reports${search}`).request();
          let searchType;
          if (window.location.pathname.includes('kbmatches')) {
            searchType = 'kbmatches';
            setVariants(Array.from(new Set(reports.map((report) => report.kbMatches[0].kbVariant))));
          } else {
            setVariants(Array.from(new Set(reports.map((report) => report.genomicAlterationsIdentified[0].geneVariant))));
          }

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
              searchReportsColumns(report, analyst, reviewer, bioinformatician, searchType)
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
  }, [search, setIsLoading]);

  const handleChipDeleted = useCallback((deleteVariant) => {
    try {
      setVariants(variants.filter((variant) => variant !== deleteVariant));
      setRowData(rowData.filter((row) => row.matchedVariant !== deleteVariant));
      setChipSelected('');
    } catch (err) {
      snackbar.error(`Cannot remove variant due to error: ${err}`);
    }
  }, [variants, rowData]);

  const handleChipClicked = useCallback((highlightVariant) => {
    try {
      if (highlightVariant === chipSelected) {
        setChipSelected('');
      } else {
        setTempRowData(rowData.filter((row) => row.matchedVariant === highlightVariant));
        setChipSelected(highlightVariant);
      }
    } catch (err) {
      snackbar.error(`Cannot select variant due to error: ${err}`);
    }
  }, [chipSelected, rowData]);

  if (isLoading) { return null; }

  return (
    <>
      {Boolean(variants?.length) && (
        <>
          <Typography variant="h3" className="reports-table__typography">
            Matching Variants
          </Typography>
          <div className="reports-table__variant-chips">
            {variants.map((variant) => (
              <React.Fragment key={variant}>
                <Chip
                  sx={{ margin: '3px' }}
                  label={`${variant}`}
                  clickable
                  onDelete={() => handleChipDeleted(variant)}
                  onClick={() => handleChipClicked(variant)}
                  color={variant === chipSelected ? 'primary' : 'default'}
                />
              </React.Fragment>
            ))}
          </div>
        </>
      )}
      <div className="reports-table">
        <DataTable
          rowData={chipSelected ? tempRowData : rowData}
          columnDefs={searchColumnDefs}
          titleText="Matching Reports"
          isFullLength
          isSearch
        />
      </div>
    </>
  );
};

export default withLoading(ReportsByVariantView);
