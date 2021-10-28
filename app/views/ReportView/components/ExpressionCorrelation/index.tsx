import React, {
  useEffect, useState, useContext,
} from 'react';
import orderBy from 'lodash.orderby';
import {
  Divider,
  Typography,
} from '@material-ui/core';

import api from '@/services/api';
import ReportContext from '@/context/ReportContext';
import snackbar from '@/services/SnackbarUtils';
import Image, { ImageType } from '@/components/Image';
import DemoDescription from '@/components/DemoDescription';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import CorrelationPlot from './components/CorrelationPlot';
import PlotByKey from './components/PlotByKey';

import './index.scss';

const IMAGE_KEYS = [
  'expression.chart',
  'expression.legend',
  'expression.spearman.cser',
  'expression.spearman.hartwig',
  'expression.spearman.target',
  'expression.spearman.tcga',
  'expression.spearman.gtex',
  'scpPlot',
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
          const [plotData, subtypePlotData, pairwiseData] = await Promise.all([
            api.get(
              `/reports/${report.ident}/image/${IMAGE_KEYS.join(',')}`,
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

  useEffect(() => {

  }, []);

  return (
    <>
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
            <div>
              <Typography variant="h3">Sample-Sample Expression Correlation</Typography>
              <div className="expression-correlation__expression-charts">
                <span>
                  <Typography variant="h3" align="center" className="expression-correlation__header">
                    Expression Chart
                  </Typography>
                  <PlotByKey
                    accessor="expression.chart"
                    plots={plots}
                  />
                </span>
                <span>
                  <Typography variant="h3" align="center" className="expression-correlation__header">
                    Expression Legend
                  </Typography>
                  <PlotByKey
                    accessor="expression.legend"
                    plots={plots}
                  />
                </span>
              </div>
            </div>
            {Boolean(subtypePlots.length) && (
              <div className="expression-correlation__subtype">
                <span>
                  <Typography variant="h3" align="center" className="expression-correlation__header">
                    Subtype Plots
                  </Typography>
                  {subtypePlots.map((plot) => (
                    <Image
                      key={plot.ident}
                      image={plot}
                      showTitle
                      showCaption
                    />
                  ))}
                </span>
              </div>
            )}
            <Divider />
            <Typography className="expression-correlation__title" variant="h3">
              Pairwise Expression Correlation
            </Typography>
            <CorrelationPlot
              pairwiseExpression={pairwiseExpression}
            />
            <Divider />
            <Typography className="expression-correlation__title" variant="h3">
              SCOPE
            </Typography>
            <div className="expression-correlation__scp-plot">
              <PlotByKey
                plots={plots}
                accessor="scpPlot"
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default withLoading(ExpressionCorrelation);
