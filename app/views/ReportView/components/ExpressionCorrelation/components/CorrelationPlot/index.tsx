import React, { useEffect, useState, useRef } from 'react';
import { HorizontalBar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import DataTable from '@/components/DataTable';
import { getColor, getLuminance } from './colors';
import columnDefs from './columnDefs';

import './index.scss';

const LUMINANCE_THRESHOLD = 186;
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

type CorrelationPlotProps = {
  pairwiseExpression: any[];
};

const CorrelationPlot = ({
  pairwiseExpression,
}: CorrelationPlotProps): JSX.Element => {
  const [modifiedRowData, setModifiedRowData] = useState();
  const [barChartData, setBarChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [rowClicked, setRowClicked] = useState();

  const chartRef = useRef();

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
    <div className="correlation-plot__group">
      {Boolean(Object.values(barChartData.datasets).length) && (
        <div className="correlation-plot__chart">
          <HorizontalBar
            ref={chartRef}
            data={barChartData}
            height={150 + (barChartData.datasets[0].data.length * 25)}
            options={options}
            plugins={[ChartDataLabels]}
          />
        </div>
      )}
      <div className="correlation-plot__table">
        <DataTable
          rowData={pairwiseExpression}
          columnDefs={columnDefs}
          highlightRow={rowClicked}
          onRowDataChanged={handleRowDataChanged}
        />
      </div>
    </div>
  );
};

export default CorrelationPlot;
