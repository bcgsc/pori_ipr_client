import React, { useEffect, useState, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
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
  const allWhite = rowData.map(() => '#FFFFFF');

  const datasets = [
    {
      label: '',
      backgroundColor: colors,
      borderColor: allWhite,
      borderWidth: 2,
      borderSkipped: 'left',
      barPercentage: 1,
      hoverBackgroundColor: colors,
      hoverBorderColor: allWhite,
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
    indexAxis: 'y',
    onClick: (event, [context]) => {
      if (context && chartRef.current) {
        if (rowClicked === context.index) {
          setRowClicked(null);
          const newColors = chartRef.current.config.data.datasets[0].borderColor.map(() => '#FFFFFF');
          chartRef.current.config.data.datasets[0].borderColor = newColors;
          chartRef.current.config.data.datasets[0].hoverBorderColor = newColors;
          chartRef.current.update();
        } else {
          setRowClicked(context.index);
          const newColors = chartRef.current.config.data.datasets[0].borderColor.map((color, index) => {
            if (index === context.index) {
              return '#000000';
            }
            return '#FFFFFF';
          });
          chartRef.current.config.data.datasets[0].borderColor = newColors;
          chartRef.current.config.data.datasets[0].hoverBorderColor = newColors;
          chartRef.current.update();
        }
      }
    },
    scales: {
      x: {
        title: {
          text: 'Correlation',
          display: true,
        },
        display: true,
      },
      y: {
        title: {
          text: 'Libraries',
          display: true,
        },
        display: true,
      },
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
      legend: {
        display: false,
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
          <Bar
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
