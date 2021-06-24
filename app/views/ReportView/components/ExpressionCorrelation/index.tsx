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

interface Color {
  red: number;
  green: number;
  blue: number;
}

const LOWER_COLOR = {
  red: 134,
  green: 244,
  blue: 207,
};

const UPPER_COLOR = {
  red: 25,
  green: 96,
  blue: 121,
};

const getColor = (lowerColor: Color, upperColor: Color, ratio: number): Color => {
  const newColor = {
    red: Math.floor(lowerColor.red + ratio * (upperColor.red - lowerColor.red)),
    green: Math.floor(lowerColor.green + ratio * (upperColor.green - lowerColor.green)),
    blue: Math.floor(lowerColor.blue + ratio * (upperColor.blue - lowerColor.blue)),
  };

  return newColor;
};

const LUMINANCE_THRESHOLD = 186;

/** Values are from RGB -> Luma formula: Y = 0.2126 R + 0.7152 G + 0.0722 B */
const getLuminance = (color: Color): number => {
  /** Compute sRGB, then linear RGB */
  for (let col of Object.values(color)) {
    col /= 255;
    if (col <= 0.03928) {
      col /= 12.92;
    } else {
      col = ((col + 0.055) / 1.055) ** 2.4;
    }
  }

  /** Calculate luminance from linear RGB */
  return 0.2126 * color.red + 0.7152 * color.green + 0.0722 * color.blue;
};

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

  useEffect(() => {
    Chart.pluginService.register({
      plugins: [ChartDataLabels],
    });
  }, []);

  const getGraphData = (rowData) => {
    const labels = rowData.map((data) => `${data.library} (${data.tumourContent}% TC)`);
    const colors = rowData.map((data) => `rgb(${Object.values(getColor(LOWER_COLOR, UPPER_COLOR, data.tumourContent / 100)).join(',')})`);

    const datasets = [
      {
        label: '',
        backgroundColor: colors,
        borderColor: rowData.map(() => '#FFFFFF'),
        borderWidth: 2,
        borderSkipped: 'left',
        barPercentage: 1,
        hoverBackgroundColor: colors,
        hoverBorderColor: colors,
        data: rowData.map((data) => data.correlation.toFixed(2)),
      },
    ];
    return {
      labels,
      datasets,
    };
  };

  useEffect(() => {
    if (pairwiseExpression.length) {
      setBarChartData(getGraphData(pairwiseExpression));
    }
  }, [pairwiseExpression]);

  useEffect(() => {
    if (modifiedRowData) {
      setBarChartData(getGraphData(modifiedRowData));
    }
  }, [modifiedRowData]);

  const handleRowDataChanged = (newData) => {
    setModifiedRowData(newData);
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event, [context]) => {
      if (context && chartRef.current) {
        if (rowClicked === context._index) {
          setRowClicked(null);
          const newColors = chartRef.current.chartInstance.config.data.datasets[0].borderColor.map(() => '#FFFFFF');
          chartRef.current.chartInstance.config.data.datasets[0].borderColor = newColors;
          chartRef.current.chartInstance.update();
        } else {
          setRowClicked(context._index);
          const newColors = chartRef.current.chartInstance.config.data.datasets[0].borderColor.map((color, index) => {
            if (index === context._index) {
              return '#000000';
            }
            return '#FFFFFF';
          });
          chartRef.current.chartInstance.config.data.datasets[0].borderColor = newColors;
          chartRef.current.chartInstance.update();
        }
      }
    },
    legend: {
      display: false,
    },
    scales: {
      xAxes: [{
        ticks: {
          beginAtZero: true,
        },
        scaleLabel: {
          display: true,
          labelString: 'Correlation',
        },
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Libraries',
        },
      }],
    },
    plugins: {
      datalabels: {
        color: ({ dataIndex }): string => {
          const backgroundColor = getColor(LOWER_COLOR, UPPER_COLOR, barChartData.datasets[0].data[dataIndex]);
          const luminance = getLuminance(backgroundColor);

          if (luminance > LUMINANCE_THRESHOLD) {
            return 'black';
          }
          return 'white';
        },
        anchor: 'start',
        align: 'end',
        clamp: true,
      },
    },
    title: {
      display: true,
      text: 'Top 20 libraries by correlation',
    },
    tooltips: {
      enabled: false,
    },
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
