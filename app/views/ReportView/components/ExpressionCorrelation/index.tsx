import React, {
  useEffect, useState, useContext, useRef,
} from 'react';
import orderBy from 'lodash.orderby';
import { HorizontalBar, Chart } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  Divider,
  Typography,
  LinearProgress,
} from '@material-ui/core';

import api from '@/services/api';
import ReportContext from '@/context/ReportContext';
import snackbar from '@/services/SnackbarUtils';
import DataTable from '@/components/DataTable';
import Image, { ImageType } from '@/components/Image';
import DemoDescription from '@/components/DemoDescription';
import columnDefs from './columnDefs';

import './index.scss';

const ExpressionCorrelation = (): JSX.Element => {
  const { report } = useContext(ReportContext);

  const [plots, setPlots] = useState<ImageType[]>();
  const [subtypePlots, setSubtypePlots] = useState<ImageType[]>();
  const [pairwiseExpression, setPairwiseExpression] = useState([]);
  const [modifiedRowData, setModifiedRowData] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const [barChartData, setBarChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [rowClicked, setRowClicked] = useState();
  const chartRef = useRef();

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const [plotData, subtypePlotData, pairwiseData] = await Promise.all([
            api.get(`/reports/${report.ident}/image/retrieve/expression.chart,expression.legend`, {}).request(),
            api.get(`/reports/${report.ident}/image/subtype-plots`, {}).request(),
            api.get(`/reports/${report.ident}/pairwise-expression-correlation`, {}).request(),
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
  }, [report]);

  const handleRowDataChanged = (newData) => {
    setModifiedRowData(newData);
  };

  return (
    <>
      <div className="expression-correlation">
        <Typography variant="h3">
          Expression Correlation
        </Typography>
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
              <div className="expression-correlation__expression-charts">
                <span>
                  <Typography variant="h3" align="center" className="expression-correlation__header">
                    Expression Chart
                  </Typography>
                  <Image
                    image={plots.find((plot) => plot.key === 'expression.chart')}
                    showTitle
                    showCaption
                  />
                </span>
                <span>
                  <Typography variant="h3" align="center" className="expression-correlation__header">
                    Expression Legend
                  </Typography>
                  <Image
                    image={plots.find((plot) => plot.key === 'expression.legend')}
                    showTitle
                    showCaption
                  />
                </span>
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
              <span className="expression-correlation__chart-group">
                {Boolean(Object.values(barChartData.datasets).length) && (
                  <div className="expression-correlation__chart">
                    <HorizontalBar
                      ref={chartRef}
                      data={barChartData}
                      height={150 + (barChartData.datasets[0].data.length * 25)}
                      options={options}
                    />
                  </div>
                )}
                {Boolean(pairwiseExpression.length) && (
                  <DataTable
                    rowData={pairwiseExpression}
                    columnDefs={columnDefs}
                    highlightRow={rowClicked}
                    onRowDataChanged={handleRowDataChanged}
                  />
                )}
              </span>
            </div>
          </>
        )}
        {isLoading && (
          <LinearProgress />
        )}
      </div>
    </>
  );
};

export default ExpressionCorrelation;
