import React, { useEffect, useState } from 'react';
import orderBy from 'lodash.orderby';
import { HorizontalBar, Chart } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

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


const CorrelationPlot = (): JSX.Element => {
  useEffect(() => {
    Chart.pluginService.register({
      plugins: [ChartDataLabels],
    });
  }, []);

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

  );
};

export default CorrelationPlot;
