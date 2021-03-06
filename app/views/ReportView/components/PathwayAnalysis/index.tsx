import React, {
  useState, useContext, useEffect, useCallback,
} from 'react';
import {
  Typography,
  LinearProgress,
} from '@material-ui/core';

import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import { ImageType } from '@/components/Image';
import ReportContext from '@/context/ReportContext';
import DemoDescription from '@/components/DemoDescription';
import PathwayImageType from './types';
import Legend from './components/Legend';
import Pathway from './components/Pathway';

import './index.scss';

type PathwayAnalysisProps = {
  isPrint?: boolean;
  loadedDispatch?: (type: Record<'type', string>) => void;
};

const PathwayAnalysis = ({
  isPrint = false,
  loadedDispatch,
}: PathwayAnalysisProps): JSX.Element => {
  const { report } = useContext(ReportContext);

  const [pathwayImage, setPathwayImage] = useState<PathwayImageType>();
  const [legend, setLegend] = useState<string | ImageType>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const pathwayImageResp = await api.get(
            `/reports/${report.ident}/summary/pathway-analysis`,
            {},
          ).request();
          setPathwayImage(pathwayImageResp);

          const type = pathwayImageResp?.legend;
          if (type === 'v1') {
            setLegend('img/pathway_legend_v1.png');
          } else if (type === 'v2') {
            setLegend('img/pathway_legend_v2.png');
          } else if (type === 'custom') {
            const legendResp = await api.get(
              `/reports/${report.ident}/image/retrieve/pathwayAnalysis.legend`,
              {},
            ).request();
            setLegend(legendResp[0]);
          }
        } catch (err) {
          snackbar.error(`Network error: ${err}`);
        } finally {
          setIsLoading(false);
          if (loadedDispatch) {
            loadedDispatch({ type: 'pathway' });
          }
        }
      };
      getData();
    }
  }, [loadedDispatch, report]);

  const handlePathwayChange = useCallback(async (newPathway) => {
    if (!legend) {
      const type = newPathway?.legend;
      if (type === 'v1') {
        setLegend('img/pathway_legend_v1.png');
      } else if (type === 'v2') {
        setLegend('img/pathway_legend_v2.png');
      } else if (type === 'custom') {
        const legendResp = await api.get(
          `/reports/${report.ident}/image/retrieve/pathwayAnalysis.legend`,
          {},
        ).request();
        setLegend(legendResp[0]);
      }
    }
  }, [legend, report]);

  return (
    <div className="pathway">
      <Typography variant="h3">Pathway Analysis</Typography>
      <DemoDescription>
        This section is for display of a graphical or visual summary of the sequencing results in the context of biological pathways. This enables the visualization of multiple genomic alterations affecting often diverse biological pathways.
      </DemoDescription>
      {!isLoading ? (
        <>
          <Pathway
            initialPathway={pathwayImage}
            isPrint={isPrint}
            onChange={handlePathwayChange}
          />
          <Legend
            initialLegend={legend}
            type={pathwayImage?.legend}
            isPrint={isPrint}
          />
        </>
      ) : (
        <LinearProgress />
      )}
    </div>
  );
};

export default PathwayAnalysis;
