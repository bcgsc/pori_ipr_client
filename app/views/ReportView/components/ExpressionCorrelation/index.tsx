import React, {
  useEffect, useState, useContext, useRef,
} from 'react';
import orderBy from 'lodash.orderby';
import { HorizontalBar, Chart } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Typography } from '@material-ui/core';

import ReportContext from '../../../../components/ReportContext';
import ImageService from '../../../../services/reports/image.service';
import DataTable from '../../../../components/DataTable';
import columnDefs from './columnDefs';
import { getPairwiseExpressionCorrelation } from '../../../../services/reports/pairwise-expression';
import Image from '../../../../components/Image';

import './index.scss';

interface Color {
  red: number,
  green: number,
  blue: number,
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

const ExpressionCorrelation = () => {
  const { report } = useContext(ReportContext);

  const [plots, setPlots] = useState({});
  const [subtypePlots, setSubtypePlots] = useState({});
  const [pairwiseExpression, setPairwiseExpression] = useState([]);
  const [modifiedRowData, setModifiedRowData] = useState();

  const [barChartData, setBarChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [rowClicked, setRowClicked] = useState();
  const chartRef = useRef();

  useEffect(() => {
    if (report) {
      const getData = async () => {
        const [plotData, subtypePlotData, pairwiseData] = await Promise.all([
          ImageService.get(report.ident, 'expression.chart,expression.legend'),
          ImageService.subtypePlots(report.ident),
          getPairwiseExpressionCorrelation(report.ident),
        ]);

        setPlots(plotData);
        setSubtypePlots(subtypePlotData);
        setPairwiseExpression(orderBy(pairwiseData, ['correlation'], ['desc']).slice(0, 19));
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
    const labels = rowData.map(data => `${data.library} (${data.tumourContent}% TC)`);
    const colors = rowData.map(data => `rgb(${Object.values(getColor(LOWER_COLOR, UPPER_COLOR, data.tumourContent)).join(',')})`);

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
        data: rowData.map(data => data.correlation.toFixed(2)),
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
        {plots && subtypePlots && (
          <>
            <div>
              <div className="expression-correlation__expression-charts">
                {plots['expression.chart'] && (
                  <span>
                    <Typography variant="h3" align="center" className="expression-correlation__header">
                      Expression Chart
                    </Typography>
                    <Image
                      image={plots['expression.chart']}
                      showTitle
                      showCaption
                    />
                  </span>
                )}
                {plots['expression.legend'] && (
                  <span>
                    <Typography variant="h3" align="center" className="expression-correlation__header">
                      Expression Legend
                    </Typography>
                    <Image
                      image={plots['expression.legend']}
                      showTitle
                      showCaption
                    />
                  </span>
                )}
              </div>
              {Boolean(Object.values(subtypePlots).length) && (
                <div className="expression-correlation__subtype">
                  <span>
                    <Typography variant="h3" align="center" className="expression-correlation__header">
                      Subtype Plots
                    </Typography>
                    {Object.values(subtypePlots).map(plot => (
                      <Image
                        image={plot}
                        showTitle
                        showCaption
                      />
                    ))}
                  </span>
                </div>
              )}
            </div>
            {!Object.values(plots).length && !Object.values(subtypePlots).length && (
              <Typography align="center">No expression correlation plots found</Typography>
            )}
          </>
        )}
      </div>
      {Boolean(Object.values(barChartData.datasets).length) && (
        <span className="expression-correlation__chart-group">
          <div className="expression-correlation__chart">
            <HorizontalBar
              ref={chartRef}
              data={barChartData}
              height={150 + (barChartData.datasets[0].data.length * 25)}
              // width={600}
              options={options}
            />
          </div>
          {Boolean(pairwiseExpression.length) && (
            <DataTable
              rowData={pairwiseExpression}
              columnDefs={columnDefs}
              highlightRow={rowClicked}
              onRowDataChanged={handleRowDataChanged}
            />
          )}
        </span>
      )}
    </>
  );
};

export default ExpressionCorrelation;
