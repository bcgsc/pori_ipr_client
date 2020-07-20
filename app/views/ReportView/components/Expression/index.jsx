import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Typography, Paper } from '@material-ui/core';

import DataTable from '../../../../components/DataTable';
import columnDefs from './columnDefs';
import ExpressionService from '@/services/reports/expression.service';
import { processExpression, getPtxComparator } from './processData';

import './index.scss';

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
  const [comparators, setComparators] = useState();
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
        const outliers = await ExpressionService.all(report.ident);

        if (outliers && outliers.length) {
          setExpOutliers(processExpression(outliers));
          setPtxComparator(getPtxComparator(outliers));
        }
      };

      setTissueSites([
        [
          { key: 'Diagnosis', value: report.patientInformation.diagnosis },
          { key: 'Biopsy Type', value: report.patientInformation.biopsySite },
        ],
        [
          { key: 'Site of Primary Disease', value: 'N/A' },
          { key: 'Biopsy Site', value: 'N/A' },
        ],
        [
          { key: 'Tumour Content', value: `${report.tumourAnalysis.tumourContent}%` || 'N/A' },
          { key: 'Ploidy Model', value: report.tumourAnalysis.ploidy },
        ],
      ]);
      getData();
    }
  }, [report]);

  useEffect(() => {
    if (ptxComparator) {
      setComparators([
        { key: 'Tissue Comparator', value: `GTEX ${report.tumourAnalysis.normalExpressionComparator}` },
        { key: 'Disease Expression Comparator', value: `TCGA ${report.tumourAnalysis.diseaseExpressionComparator}` },
        { key: 'Protein Expression Comparator', value: `POG ${ptxComparator}` },
      ]);
    }
  }, [ptxComparator]);

  const handleVisibleColsChange = (change) => {
    setVisibleCols(change);
  };

  const handleHiddenColsChange = (change) => {
    setHiddenCols(change);
  };

  return (
    <>
      {report && tissueSites && (
        <div className="expression--padded">
          <Typography variant="h1" className="expression__title">
            Expression Analysis
          </Typography>
          <Typography variant="h3" className="expression__subtitle">
            Tissue Sites
          </Typography>
          <Paper elevation={0} className="expression__box">
            {tissueSites.map((site, index) => (
              <span
                key={index}
                className="expression__box-column"
              >
                {site.map(({ key, value }) => (
                  <div key={key} className="expression__box-row">
                    <Typography display="inline" className="expression__key">
                      {`${key}: `}
                    </Typography>
                    <Typography display="inline" className="expression__value">
                      {value}
                    </Typography>
                  </div>
                ))}
              </span>
            ))}
          </Paper>
          <Typography variant="h3" className="expression__subtitle">
            Expression Correlation Summary and Comparator Choices
          </Typography>
          {comparators ? (
            <Paper elevation={0} className="expression__comparator-box" square>
              {comparators.map(({ key, value }) => (
                <div key={key} className="expression__comparator-column">
                  <Typography className="expression__comparator-value--padded">
                    {key}
                  </Typography>
                  <Typography className="expression__comparator-value--padded">
                    {value}
                  </Typography>
                </div>
              ))}
            </Paper>
          ) : null}
        </div>
      )}
      <>
        {expOutliers && (
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
        )}
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
