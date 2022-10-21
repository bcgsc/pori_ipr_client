import React, {
  useEffect, useState, useContext, useMemo,
} from 'react';
import orderBy from 'lodash/orderBy';
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
import partition from 'lodash/partition';
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

const SAMPLE_EXPRESSION_KEYS_TO_GET = [
  { key: 'expression.spearman.tcga', title: 'TCGA' },
  { key: 'expression.spearman.pediatric', title: 'PEDIATRIC' },
  { key: 'expression.spearman.target', title: 'TARGET' },
  { key: 'expression.spearman.hartwig', title: 'HARTWIG' },
  { key: 'expression.spearman.cser', title: 'CSER' },
  { key: 'expression.spearman.gtex', title: 'GTEX' },
];

const DISEASE_SPECIFIC_EXPRESSION_KEYS_TO_GET = [
  { key: 'expression.spearman.brca.molecular', title: '' },
  { key: 'expression.spearman.brca.receptor', title: '' },
];

const DEFAULT_IMG_WIDTH = 800;

type ExpressionChartProps = {
  plotData: ImageType[],
  keySet: { key: string, title: string }[],
};

const ExpressionChart = ({
  plotData,
  keySet,
}: ExpressionChartProps): JSX.Element => (
  <>
    {keySet.map((group) => (
      <div key={group.key}>
        <Typography variant="h3" align="center" className="expression-correlation__header">
          {group.title}
        </Typography>
        <PlotByKey
          accessor={group.key}
          plots={plotData}
          width={DEFAULT_IMG_WIDTH}
        />
      </div>
    ))}
  </>
);

type ExpressionCorrelationProps = WithLoadingInjectedProps;

const ExpressionCorrelation = ({
  isLoading,
  setIsLoading,
}: ExpressionCorrelationProps): JSX.Element => {
  const { report } = useContext(ReportContext);

  const [samplePlots, setSamplePlots] = useState<ImageType[]>([]);
  const [diseaseSpecificPlots, setDiseaseSpecificPlots] = useState<ImageType[]>([]);
  const [subtypePlots, setSubtypePlots] = useState<ImageType[]>([]);
  const [pairwiseExpression, setPairwiseExpression] = useState([]);

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const allKeys = [
            ...IMAGE_KEYS.map((group) => group.key),
            ...LEGACY_EXPRESSION_KEYS.map((group) => group.key),
            ...SAMPLE_EXPRESSION_KEYS_TO_GET.map((group) => group.key),
            ...DISEASE_SPECIFIC_EXPRESSION_KEYS_TO_GET.map((group) => group.key),
          ].join(',');

          const [plotData, subtypePlotData, pairwiseData] = await Promise.all([
            api.get(`/reports/${report.ident}/image/retrieve/${allKeys}`).request(),
            api.get(`/reports/${report.ident}/image/subtype-plots`).request(),
            api.get(`/reports/${report.ident}/pairwise-expression-correlation`).request(),
          ]);

          const [diseaseSpecificPlotData, samplePlotData] = partition(plotData, (pd) => /brca/.test(pd.key));
          setSamplePlots(samplePlotData);
          setDiseaseSpecificPlots(diseaseSpecificPlotData);
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

  // If Target exists, and pediatric does not, display target, else filter out target
  const SAMPLE_EXPRESSION_KEYS = useMemo(() => {
    const hasPediatricData = samplePlots.find(({ key }) => key === 'expression.spearman.pediatric');
    const hasTargetData = samplePlots.find(({ key }) => key === 'expression.spearman.target');
    if (!hasPediatricData && hasTargetData) {
      return SAMPLE_EXPRESSION_KEYS_TO_GET;
    }
    return SAMPLE_EXPRESSION_KEYS_TO_GET.filter(({ key }) => key !== 'expression.spearman.target');
  }, [samplePlots]);

  const useLegacyExpressionKeys = useMemo(() => (!!samplePlots.find((plot) => plot.key === 'expression.chart')), [samplePlots]);

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
            <Typography variant="h3">Disease Specific Expression Correlation</Typography>
          </div>
          <div className="expression-correlation__expression-charts">
            <ExpressionChart
              keySet={DISEASE_SPECIFIC_EXPRESSION_KEYS_TO_GET}
              plotData={diseaseSpecificPlots}
            />
          </div>
          <Divider />
          <div className="expression-correlation__section">
            <Typography variant="h3">Sample-Sample Expression Correlation</Typography>
            <div className="expression-correlation__expression-charts">
              <ExpressionChart
                keySet={useLegacyExpressionKeys ? LEGACY_EXPRESSION_KEYS : SAMPLE_EXPRESSION_KEYS}
                plotData={samplePlots}
              />
            </div>
          </div>
          {/* This section should only appear if there's data */}
          {Boolean(samplePlots?.length) && samplePlots.find((plot) => plot.key === 'scpPlot') && (
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
                    width={DEFAULT_IMG_WIDTH}
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
                      width={DEFAULT_IMG_WIDTH}
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
