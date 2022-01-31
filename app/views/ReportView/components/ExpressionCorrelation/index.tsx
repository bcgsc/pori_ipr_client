import React, {
  useEffect, useState, useContext,
} from 'react';
import orderBy from 'lodash.orderby';
import {
  Divider,
  Typography,
} from '@mui/material';

import api from '@/services/api';
import ReportContext from '@/context/ReportContext';
import snackbar from '@/services/SnackbarUtils';
import Image, { ImageType } from '@/components/Image';
import DemoDescription from '@/components/DemoDescription';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import CorrelationPlot from './components/CorrelationPlot';
import PlotByKey from './components/PlotByKey';

import './index.scss';

const LEGACY_EXPRESSION_KEYS = [
  { key: 'expression.chart', title: 'Expression Chart' },
  { key: 'expression.legend', title: 'Expression Legend' },
];

const IMAGE_KEYS = [
  { key: 'scpPlot', title: 'SCOPE' },
];

const EXPRESSION_KEYS = [
  { key: 'expression.spearman.tcga', title: 'TCGA' },
  { key: 'expression.spearman.target', title: 'TARGET' },
  { key: 'expression.spearman.hartwig', title: 'HARTWIG' },
  { key: 'expression.spearman.cser', title: 'CSER' },
  { key: 'expression.spearman.gtex', title: 'GTEX' },
];

type ExpressionCorrelationProps = WithLoadingInjectedProps;

const ExpressionCorrelation = ({
  isLoading,
  setIsLoading,
}: ExpressionCorrelationProps): JSX.Element => {
  const { report } = useContext(ReportContext);

  const [plots, setPlots] = useState<ImageType[]>([]);
  const [subtypePlots, setSubtypePlots] = useState<ImageType[]>([]);
  const [pairwiseExpression, setPairwiseExpression] = useState([]);

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const allKeys = [
            ...IMAGE_KEYS.map((group) => group.key),
            ...LEGACY_EXPRESSION_KEYS.map((group) => group.key),
            ...EXPRESSION_KEYS.map((group) => group.key),
          ].join(',');

          const [plotData, subtypePlotData, pairwiseData] = await Promise.all([
            api.get(
              `/reports/${report.ident}/image/retrieve/${allKeys}`,
            ).request(),
            api.get(`/reports/${report.ident}/image/subtype-plots`).request(),
            api.get(`/reports/${report.ident}/pairwise-expression-correlation`).request(),
          ]);

          setPlots(plotData);
          setSubtypePlots(subtypePlotData);
          setPairwiseExpression(orderBy(pairwiseData, ['correlation'], ['desc']).slice(0, 19));
        } catch (err) {
          snackbar.error(`Network error: ${err}`);
        } finally {
          setIsLoading(false);
        }
      };

      getData();
    }
  }, [report, setIsLoading]);

  const sampleExpressionCharts = (keySet: { key: string, title: string }[]): JSX.Element => (
    <>
      {keySet.map((group) => (
        <div key={group.key}>
          <Typography variant="h3" align="center" className="expression-correlation__header">
            {group.title}
          </Typography>
          <PlotByKey
            accessor={group.key}
            plots={plots}
          />
        </div>
      ))}
    </>
  );

  return (
    <div className="expression-correlation">
      <DemoDescription>
        The overall gene expression in the tumour is compared to a gene expression profiles from
        variety of tumour types, either from internal or external curated datasets, using a
        correlation approach, to highlight the most similar tumour types. In addition, the tumour
        is compared to previously sequenced tumours to identify the most similar individual
        samples. Subtyping based on gene expression is computed if applicable for the tumour type.
      </DemoDescription>
      {!isLoading && (
        <>
          <Typography variant="h3">
            Pairwise Expression Correlation
          </Typography>
          <CorrelationPlot
            pairwiseExpression={pairwiseExpression}
          />
          <Divider />
          <div className="expression-correlation__section">
            <Typography variant="h3">Sample-Sample Expression Correlation</Typography>
            <div className="expression-correlation__expression-charts">
              {sampleExpressionCharts(plots.find((plot) => plot.key === 'expression.chart')
                ? LEGACY_EXPRESSION_KEYS
                : EXPRESSION_KEYS)}
            </div>
          </div>
          {/* This section should only appear if there's data */}
          {Boolean(plots?.length) && plots.find((plot) => plot.key === 'scpPlot') && (
            <>
              <Divider />
              <div className="expression-correlation__section">
                <Typography className="expression-correlation__title" variant="h3">
                  SCOPE
                </Typography>
                <div className="expression-correlation__scp-plot">
                  <PlotByKey
                    plots={plots}
                    accessor="scpPlot"
                  />
                </div>
              </div>
            </>
          )}
          {/* This section should only appear if there's data */}
          {Boolean(subtypePlots.length) && (
            <>
              <Divider />
              <div className="expression-correlation__section">
                <Typography variant="h3" className="expression-correlation__header">
                  Subtyping
                </Typography>
                <div className="expression-correlation__subtype">
                  {subtypePlots.map((plot) => (
                    <Image
                      key={plot.ident}
                      image={plot}
                      showTitle
                      showCaption
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default withLoading(ExpressionCorrelation);
