import React, { useEffect, useState, useContext } from 'react';
import ReportContext from '../ReportContext';
import ImageService from '@/services/reports/image.service';
import Image from '@/components/Image';
import { Typography } from '@material-ui/core';

import './index.scss';

const ExpressionCorrelation = () => {
  const { report } = useContext(ReportContext);
  const [plots, setPlots] = useState();
  const [subtypePlots, setSubtypePlots] = useState();

  useEffect(() => {
    if (report) {
      const getData = async () => {
        const [plotData, subtypePlotData] = await Promise.all([
          ImageService.get(report.ident, 'microbial.circos,expression.chart,expression.legend'),
          ImageService.subtypePlots(report.ident),
        ]);

        setPlots(plotData);
        setSubtypePlots(subtypePlotData);
      }

      getData();
    }
  }, [report]);

  return (
    <div className="expression-correlation">
      <Typography variant="h1">
        Expression Correlation
      </Typography>
      {plots && subtypePlots && (
        <>
          <div>
            {plots['microbial.circos'] && (
              <span>
                <Typography variant="h3">Microbial Circos</Typography>
                <Image
                  image={plots['microbial.circos']}
                  showTitle
                  showSubtitle
                />
              </span>
            )}
            <div className="expression-correlation__expression-charts">
              {plots['expression.chart'] && (
                <span>
                  <Typography variant="h3" align="center">Expression Chart</Typography>
                  <Image
                    image={plots['expression.chart']}
                    showTitle
                    showSubtitle
                  />
                </span>
              )}
              {plots['expression.legend'] && (
                <span>
                  <Typography variant="h3" align="center">Expression Legend</Typography>
                  <Image
                    image={plots['expression.legend']}
                    showTitle
                    showSubtitle
                  />
                </span>
              )}
            </div>
            {Boolean(subtypePlots.length) && (
              <div className="expression-correlation__subtype">
                <span>
                  <Typography variant="h3" align="center">Subtype Plots</Typography>
                  {Object.values(subtypePlots).map(plot => (
                    <Image
                      image={plot}
                      showTitle
                      showSubtitle
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
  );
};

export default ExpressionCorrelation;
