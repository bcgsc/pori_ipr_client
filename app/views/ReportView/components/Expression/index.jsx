import React, { useState, useEffect, useContext } from 'react';
import { Typography, Paper, LinearProgress } from '@material-ui/core';

import DataTable from '@/components/DataTable';
import api from '@/services/api';
import DemoDescription from '@/components/DemoDescription';
import ReportContext from '@/context/ReportContext';
import columnDefs from './columnDefs';
import processExpression from './processData';

import './index.scss';

const TITLE_MAP = {
  clinical: 'Expression Level Outliers of Potential Clinical Relevance',
  nostic: 'Expression Level Outliers of Prognostic or Diagnostic Relevance',
  biological: 'Expression Level Outliers of Biological Relevance',
  upreg_onco: 'Up-Regulated Oncogenes',
  downreg_tsg: 'Down-Regulated Tumour Suppressor Genes',
};

const getInfoDescription = (relevance) => `Expression level variants where the variant matched 1 or more statements of ${relevance} relevance in the knowledge base matches section. Details on these matches can be seen in the knowledge base matches section of this report.`;

const INFO_BUBBLES = {
  biological: getInfoDescription('biological'),
  nostic: getInfoDescription('prognostic or diagnostic'),
  clinical: getInfoDescription('therapeutic'),
  upreg_onco: 'High expression level outliers in known oncogenes.',
  downreg_tsg: 'Low expression level outliers in known tumour suppressor genes.',
};

/**
 * @param {object} props props
 * @param {array} props.outliers list of outlier data
 * @param {string} props.titleText title of table
 * @return {*} JSX
 */
const Expression = () => {
  const { report } = useContext(ReportContext);
  const [tissueSites, setTissueSites] = useState();
  const [comparators, setComparators] = useState();
  const [expOutliers, setExpOutliers] = useState();
  const [visibleCols, setVisibleCols] = useState(
    columnDefs.filter((c) => !c.hide).map((c) => c.field),
  );

  const [hiddenCols, setHiddenCols] = useState(
    columnDefs.filter((c) => c.hide).map((c) => c.field),
  );

  useEffect(() => {
    if (report && report.ident) {
      const getData = async () => {
        const [outliers, images] = await Promise.all([
          api.get(`/reports/${report.ident}/expression-variants`).request(),
          api.get(`/reports/${report.ident}/image/expression-density-graphs`).request(),
        ]);

        if (outliers && outliers.length) {
          const processedOutliers = processExpression(outliers);

          const imageAttachedOutliers = Object.entries(processedOutliers).reduce((accumulator, [key, value]) => {
            const newValues = value.map((val) => ({ ...val, image: images.find((img) => img.key === `expDensity.${val.gene.name}`) }));
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
  }, [report]);

  useEffect(() => {
    if (report && report.ident) {
      const getData = async () => {
        const comparatorsResp = await api.get(
          `/reports/${report.ident}/comparators`,
          {},
        ).request();

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
          <DemoDescription>
            The most appropriate normal tissue and tumour tissues are chosen for expression
            comparisons based on the tumour type and observed correlation with tissue data sets.
            If no appropriate tissue comparator is available, for instance for rare tumours, an
            average across all tissues is used. Expression is calculated as percentile and kIQR
            (number of interquartile ranges) relative to comparator expression distributions.
            Outlier expression refers to genes with very high or very low expression compared to
            what is seen in other cancers of that type and also compared to relevant normal tissue.
          </DemoDescription>
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
          {comparators && !comparators.length && (
            <Typography align="center">No comparator data to display</Typography>
          )}
        </div>
      )}
      <>
        {expOutliers ? (
          <>
            {Object.entries(TITLE_MAP).map(([key, titleText]) => (
              <DataTable
                key={key}
                columnDefs={columnDefs}
                rowData={expOutliers[key]}
                titleText={titleText}
                visibleCols={visibleCols}
                hiddenCols={hiddenCols}
                setVisibleCols={handleVisibleColsChange}
                setHiddenCols={handleHiddenColsChange}
                canToggleColumns
                demoDescription={INFO_BUBBLES[key]}
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
