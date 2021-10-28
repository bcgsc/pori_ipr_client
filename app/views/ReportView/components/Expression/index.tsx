import React, { useState, useEffect, useContext } from 'react';
import { Typography, Paper } from '@material-ui/core';

import DataTable from '@/components/DataTable';
import api from '@/services/api';
import DemoDescription from '@/components/DemoDescription';
import ReportContext from '@/context/ReportContext';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import { ImageType } from '@/components/Image';
import columnDefs from './columnDefs';
import processExpression from './processData';
import {
  TissueSitesType,
  FormattedComparatorsType,
  ComparatorType,
  ProcessedExpressionOutliers,
  ExpOutliersType,
} from './types';

import './index.scss';

const TITLE_MAP = {
  clinical: 'Expression Level Outliers of Potential Clinical Relevance',
  nostic: 'Expression Level Outliers of Prognostic or Diagnostic Relevance',
  biological: 'Expression Level Outliers of Biological Relevance',
  upreg_onco: 'Up-Regulated Oncogenes',
  downreg_tsg: 'Down-Regulated Tumour Suppressor Genes',
};

const getInfoDescription = (relevance: string) => `Expression level variants 
where the variant matched 1 or more statements of ${relevance} relevance in 
the knowledge base matches section. Details on these matches can be seen in the 
knowledge base matches section of this report.`;

const INFO_BUBBLES = {
  biological: getInfoDescription('biological'),
  nostic: getInfoDescription('prognostic or diagnostic'),
  clinical: getInfoDescription('therapeutic'),
  upreg_onco: 'High expression level outliers in known oncogenes.',
  downreg_tsg: 'Low expression level outliers in known tumour suppressor genes.',
};

type ExpressionProps = WithLoadingInjectedProps;

const Expression = ({
  isLoading,
  setIsLoading,
}: ExpressionProps): JSX.Element => {
  const { report } = useContext(ReportContext);
  const [tissueSites, setTissueSites] = useState<TissueSitesType>();
  const [comparators, setComparators] = useState<FormattedComparatorsType>();
  const [expOutliers, setExpOutliers] = useState<ProcessedExpressionOutliers>();
  const [visibleCols, setVisibleCols] = useState<string[]>(
    columnDefs.filter((c) => !c.hide).map((c) => c.field),
  );

  useEffect(() => {
    if (report && report.ident) {
      const getData = async () => {
        const [outliers, images] = await Promise.all([
          api.get<ExpOutliersType[]>(`/reports/${report.ident}/expression-variants`).request(),
          api.get<ImageType[]>(`/reports/${report.ident}/image/expression-density-graphs`).request(),
        ]);

        if (outliers && outliers.length) {
          const processedOutliers: ProcessedExpressionOutliers = processExpression(outliers);

          const imageAttachedOutliers = Object.entries(processedOutliers)
            .reduce((accumulator, [key, value]) => {
              const newValues = value.map((val) => ({
                ...val,
                image: images.find((img: ImageType) => img.key === `expDensity.${val.gene.name}`),
              }));

              accumulator[key] = newValues;
              return accumulator;
            }, {} as ProcessedExpressionOutliers);

          setExpOutliers(imageAttachedOutliers);
        }
        setIsLoading(false);
      };

      getData();
    }
  }, [report, setIsLoading]);

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
        const comparatorsResp = await api.get<ComparatorType[]>(
          `/reports/${report.ident}/comparators`,
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

  return (
    <>
      {!isLoading && (
        <>
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
                  // eslint-disable-next-line react/no-array-index-key
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
          {expOutliers && (
            <>
              {Object.entries(TITLE_MAP).map(([key, titleText]) => (
                <DataTable
                  key={key}
                  columnDefs={columnDefs}
                  rowData={expOutliers[key]}
                  titleText={titleText}
                  visibleColumns={visibleCols}
                  syncVisibleColumns={handleVisibleColsChange}
                  canToggleColumns
                  demoDescription={INFO_BUBBLES[key]}
                />
              ))}
            </>
          )}
        </>
      )}
    </>
  );
};

export default withLoading(Expression);
