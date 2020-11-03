import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Typography, Paper, LinearProgress } from '@material-ui/core';

import DataTable from '../../../../components/DataTable';
import columnDefs from './columnDefs';
import { getComparators } from '@/services/reports/comparators';
import ExpressionService from '@/services/reports/expression.service';
import ImageService from '@/services/reports/image.service';
import ReportContext from '../../../../components/ReportContext';
import processExpression from './processData';

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
const Expression = () => {
  const { report } = useContext(ReportContext);
  const [tissueSites, setTissueSites] = useState();
  const [comparators, setComparators] = useState();
  const [expOutliers, setExpOutliers] = useState();
  const [visibleCols, setVisibleCols] = useState(
    columnDefs.filter(c => !c.hide).map(c => c.field),
  );

  const [hiddenCols, setHiddenCols] = useState(
    columnDefs.filter(c => c.hide).map(c => c.field),
  );

  useEffect(() => {
    if (report && report.ident) {
      const getData = async () => {
        const [outliers, images] = await Promise.all([
          ExpressionService.all(report.ident),
          ImageService.expDensityGraphs(report.ident),
        ]);

        if (outliers && outliers.length) {
          const processedOutliers = processExpression(outliers);

          const imageAttachedOutliers = Object.entries(processedOutliers).reduce((accumulator, [key, value]) => {
            const newValues = value.map(val => ({ ...val, image: images[`expDensity.${val.gene.name}`] }));
            accumulator[key] = newValues;
            return accumulator;
          }, {});

          setExpOutliers(imageAttachedOutliers);
        } else {
          setExpOutliers([]);
        }
      };

      getData();
    }
  }, [report]);

  useEffect(() => {
    if (report) {
      setTissueSites([
        [
          { key: 'Diagnosis', value: report.patientInformation.diagnosis },
          { key: 'Biopsy Type', value: report.patientInformation.biopsySite },
        ],
        [
          { key: 'Tumour Content', value: `${report.tumourContent}%` || 'N/A' },
          { key: 'Ploidy Model', value: report.ploidy },
        ],
      ]);
    }
  }, [report])

  useEffect(() => {
    if (report && report.ident) {
      const getData = async () => {
        const comparatorsResp = await getComparators(report.ident);

        const diseaseExpression = comparatorsResp.find(({ analysisRole }) => (
          analysisRole === 'expression (disease)'
        ));

        const normalPrimary = comparatorsResp.find(({ analysisRole }) => (
          analysisRole === 'expression (primary site)'
        ));

        const normalBiopsy = comparatorsResp.find(({ analysisRole }) => (
          analysisRole === 'expression (biopsy site)'
        ));

        setComparators([
          {
            key: 'Disease Expression',
            value: diseaseExpression ? diseaseExpression.name : 'Not specified',
          },
          {
            key: 'Normal Primary Site',
            value: normalPrimary ? normalPrimary.name : 'Not specified',
          },
          {
            key: 'Normal Biopsy Site',
            value: normalBiopsy ? normalBiopsy.name : 'Not specified',
          },
        ]);
      };

      getData();
    }
  }, [report]);

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
          {comparators && (
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
          )}
          {comparators && !Boolean(comparators.length) && (
            <Typography align="center">No comparator data to display</Typography>
          )}
        </div>
      )}
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
        ) : (
          <LinearProgress />
        )}
      </>
    </>
  );
};

export default Expression;
