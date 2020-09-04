import React, { useEffect, useState, useContext, useRef } from 'react';
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

type Color = {
  red: number,
  green: number,
  blue: number,
};

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

const getColor = (lowerColor: Color, upperColor: Color, ratio: number) => {
  const newColor = {
    red: Math.floor(lowerColor.red + ratio * (upperColor.red - lowerColor.red)),
    green: Math.floor(lowerColor.green + ratio * (upperColor.green - lowerColor.green)),
    blue: Math.floor(lowerColor.blue + ratio * (upperColor.blue - lowerColor.blue)),
  };

  return newColor;
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
        const mockData = [
          {
            ident: 'L6CQ4',
            patientId: 'UPLOADPAT02',
            libraryName: 'LIB0002',
            correlation: 0.99,
            tumourType: 'pancreatic cancer',
            tissueType: 'liver',
            tumourContent: 15.2,
          },
          {
            ident: 'RQN4C',
            patientId: 'UPLOADPAT03',
            libraryName: 'LIB0003',
            correlation: 0.52,
            tumourType: 'sarcoma',
            tissueType: 'sarcoma',
            tumourContent: 15.1,
          },
          {
            ident: 'ET64E',
            patientId: 'UPLOADPAT05',
            libraryName: 'LIB0005',
            correlation: 0.1,
            tumourType: 'lung andenocarcinoma',
            tissueType: 'lung',
            tumourContent: 100,
          },
        ];
        setPairwiseExpression(orderBy(mockData, ['correlation'], ['desc']));
      }

      getData();
    }
  }, [report]);
  
  useEffect(() => {
    Chart.pluginService.register({
      plugins: [ChartDataLabels],
    });
  }, []);

  const getGraphData = (rowData) => {
    const labels = rowData.map(data => `${data.libraryName} (${data.tumourContent}% TC)`);
    const colors = rowData.map(data => `rgb(${Object.values(getColor(LOWER_COLOR, UPPER_COLOR, data.correlation)).join(',')})`);

    const datasets = [
      {
        label: '',
        backgroundColor: colors,
        borderColor: rowData.map(() => '#FFFFFF'),
        borderWidth: 2,
        borderSkipped: 'left',
        barPercentage: 1,
        hoverBackgroundColor: `rgb(${UPPER_COLOR.red},${UPPER_COLOR.green},${UPPER_COLOR.blue})`,
        hoverBorderColor: `rgb(${UPPER_COLOR.red},${UPPER_COLOR.green},${UPPER_COLOR.blue})`,
        data: rowData.map(data => data.correlation),
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
        console.log(chartRef.current);
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
        color: 'white',
        anchor: 'start',
        align: 'end',
        clamp: true,
      },
    },
    title: {
      display: true,
      text: 'Libraries by correlation',
    },
    tooltips: {
      enabled: false,
    },
  };

  return (
    <>
      <div className="expression-correlation">
        <Typography variant="h1">
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
            {!Boolean(Object.values(plots).length) && !Boolean(Object.values(subtypePlots).length) && (
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
