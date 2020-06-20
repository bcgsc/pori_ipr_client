import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import DataTable from '../../../../components/DataTable';
import columnDefs from './columnDefs';
import MutationSummaryService from '@/services/reports/mutation-summary.service';
import OutlierService from '@/services/reports/outlier.service';
import ImageService from '@/services/reports/image.service';
import { processExpression, getPtxComparator } from './processData';
import { Typography, Paper } from '@material-ui/core';

const tables = {
  clinical: 'Expression Level Outliers of Potential Clinical Relevance',
  nostic: 'Expression Level Outliers of Prognostic or Diagnostic Relevance',
  biological: 'Expression Level Outliers of Biological Relevance',
  upreg_onco: 'Up-Regulated Oncogenes',
  downreg_tsg: 'Down-Regulated Tumour Suppressor Genes',
};

/**
 * @param {object} props props
 * @param {array} props.outliers list of outlier data
 * @param {string} props.titleText title of table
 * @param {string} props.reportIdent current report ID
 * @return {*} JSX
 */
function Expression(props) {
  const {
    report,
  } = props;

  const [tissueSites, setTissueSites] = useState();
  const [outliers, setOutliers] = useState();
  const [mutationSummary, setMutationSummary] = useState();
  const [densityGraphs, setDensityGraphs] = useState();
  const [expOutliers, setExpOutliers] = useState();
  const [ptxComparator, setPtxComparator] = useState();
  const [visibleCols, setVisibleCols] = useState(
    columnDefs.filter(c => !c.hide).map(c => c.field),
  );

  const [hiddenCols, setHiddenCols] = useState(
    columnDefs.filter(c => c.hide).map(c => c.field),
  );

  useEffect(() => {
    if (report) {
      const getData = async () => {
        const promises = Promise.all([
          MutationSummaryService.get(report.ident),
          OutlierService.all(report.ident),
          ImageService.expDensityGraphs(report.ident),
        ]);
        const [mutationSummaryResp, outliersResp, densityGraphsResp] = await promises;

        setOutliers(outliersResp);
        setMutationSummary(mutationSummaryResp);
        /* can remove object call when API returns array */
        setDensityGraphs(Object.values(densityGraphsResp));
      };

      setTissueSites([
        { key: 'Diagnosis', value: report.patientInformation.diagnosis },
        { key: 'Biopsy Type', value: report.patientInformation.biopsySite },
        { key: 'Site of Primary Disease', value: 'N/A' },
        { key: 'Biopsy Site', value: 'N/A' },
        { key: 'Tumour Content', value: `${report.tumourAnalysis.tumourContent}%` || 'N/A' },
        { key: 'Ploidy Model', value: report.tumourAnalysis.ploidy },
      ]);
      getData();
    }
  }, [report]);

  useEffect(() => {
    if (outliers && outliers.length) {
      setExpOutliers(processExpression(outliers));
      setPtxComparator(getPtxComparator(outliers));
    }
  }, [outliers]);

  const handleVisibleColsChange = (change) => {
    setVisibleCols(change);
  };

  const handleHiddenColsChange = (change) => {
    setHiddenCols(change);
  };

  return (
    <>
      {report && tissueSites ? (
        <div>
          <Typography variant="h1">
            Expression Analysis
          </Typography>
          <Typography variant="h2">
            Tissue Sites
          </Typography>
          <Paper elevation={0}>
            {tissueSites.map(({ key, value }) => (
              <React.Fragment key={key}>
                <Typography display="inline">
                  {`${key}: `}
                </Typography>
                <Typography display="inline">
                  {value}
                </Typography>
              </React.Fragment>
            ))}
          </Paper>
          <Typography variant="h2">
            Expression Correlation Summary and Comparator Choices
          </Typography>
          <Paper elevation={0}>
            
          </Paper>
        </div>
      ) : null}
      <>
        {expOutliers ? (
          <>
            {Object.entries(tables).map(([key, titleText]) => (
              <DataTable
                key={key}
                columnDefs={columnDefs}
                rowData={expOutliers[key]}
                titleText={titleText}
                visibleCols={visibleCols}
                hiddenCols={hiddenCols}
                setVisibleCols={handleVisibleColsChange}
                setHiddenCols={handleHiddenColsChange}
                reportIdent={report.ident}
                canToggleColumns
              />
            ))}
          </>
        ) : null}
      </>
    </>
  );
}

Expression.propTypes = {
  report: PropTypes.objectOf(PropTypes.any),
};

Expression.defaultProps = {
  report: null,
};

export default Expression;
