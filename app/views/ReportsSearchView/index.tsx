import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Chip, Typography } from '@mui/material';
import api from '@/services/api';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import snackbar from '@/services/SnackbarUtils';
import DataTable from '@/components/DataTable';
import reportsColumns from '@/utils/reportsColumns';
import searchReportsColumns from '@/utils/searchReportsColumns';
import searchColumnDefs from '@/components/ReportsTable/searchColumnDefs';
import columnDefs from '@/components/ReportsTable/columnDefs';

import '../ReportsView/index.scss';
import './index.scss';

type ReportsSearchViewProps = WithLoadingInjectedProps;

const ReportsSearchView = ({
  isLoading,
  setIsLoading,
}: ReportsSearchViewProps): JSX.Element => {
  const { search } = useLocation();
  const [rowData, setRowData] = useState([]);
  const [tempRowData, setTempRowData] = useState([]);
  const [variants, setVariants] = useState<string[]>();
  const [chipSelected, setChipSelected] = useState('');
  const [searchCategory, setSearchCategory] = useState('');

  useEffect(() => {
    const getData = async (searchCat: string) => {
      try {
        const { reports } = await api.get(`/reports${search}`).request();

        if (searchCat === 'kbVariant') {
          setVariants(Array.from(new Set(reports.map((report) => report.kbMatches[0]?.kbVariant))));
        } else if (searchCat === 'keyVariant') {
          setVariants(Array.from(new Set(reports.map((report) => report.genomicAlterationsIdentified[0]?.geneVariant))));
        } else if (searchCat === 'diagnosis') {
          setVariants(Array.from(new Set(reports.map((report) => report.patientInformation?.diagnosis))));
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

          const reportData = report;

          if (!report.patientInformation) {
            reportData.patientInformation = {};
          }

          switch (searchCat) {
            case 'patientId':
              return (
                reportsColumns(reportData, analyst, reviewer, bioinformatician)
              );
            case 'projectName':
              return (
                reportsColumns(reportData, analyst, reviewer, bioinformatician)
              );
            case 'diagnosis':
              return (
                reportsColumns(reportData, analyst, reviewer, bioinformatician)
              );
            case 'keyVariant':
              return (
                searchReportsColumns(reportData, analyst, reviewer, bioinformatician, searchCategory)
              );
            case 'kbVariant':
              return (
                searchReportsColumns(reportData, analyst, reviewer, bioinformatician, searchCategory)
              );
            default:
              return null;
          }
        }));
      } catch (err) {
        snackbar.error(`Network error: ${err}`);
      } finally {
        setIsLoading(false);
      }
    };
    if (search) {
      // Get search category based on url param
      // eslint-disable-next-line prefer-destructuring
      setSearchCategory(search.split(/[?=]/)[1]);
      if (searchCategory) {
        getData(searchCategory);
      }
    }
  }, [search, searchCategory, setIsLoading]);

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
          <Typography variant="h3" className="variant-reports-table__typography">
            {searchCategory === 'diagnosis' ? 'Matching Diagnoses' : 'Matching Variants'}
          </Typography>
          <div className="variant-reports-table__variant-chips">
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
      {(searchCategory === 'keyVariant' || searchCategory === 'kbVariant' || searchCategory === 'diagnosis')
        ? (
          <div className="variant-reports-table">
            <DataTable
              rowData={chipSelected ? tempRowData : rowData}
              columnDefs={searchCategory === 'diagnosis' ? columnDefs : searchColumnDefs}
              titleText={`Matching Reports by ${searchCategory}`}
              isFullLength
              isSearch
            />
          </div>
        )
        : (
          <div className="reports-table">
            <DataTable
              rowData={rowData}
              columnDefs={columnDefs}
              titleText={`Matching Reports by ${searchCategory}`}
              isFullLength
              isSearch
            />
          </div>
        )}
    </>
  );
};

export default withLoading(ReportsSearchView);
