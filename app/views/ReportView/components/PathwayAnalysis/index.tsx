import React, {
  useState, useContext, useEffect, useCallback,
} from 'react';
import {
  Typography,
} from '@mui/material';

import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import { ImageType } from '@/components/Image';
import ReportContext from '@/context/ReportContext';
import DemoDescription from '@/components/DemoDescription';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import PathwayImageType from './types';
import Legend from './components/Legend';
import Pathway from './components/Pathway';

import './index.scss';

type PathwayAnalysisProps = {
  isPrint?: boolean;
  loadedDispatch?: (type: Record<'type', string>) => void;
} & WithLoadingInjectedProps;

const PathwayAnalysis = ({
  isLoading,
  isPrint = false,
  loadedDispatch,
  setIsLoading,
}: PathwayAnalysisProps): JSX.Element => {
  const { report } = useContext(ReportContext);

  const [pathwayImage, setPathwayImage] = useState<PathwayImageType>();
  const [legend, setLegend] = useState<string | ImageType>();

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const pathwayImageResp = await api.get(
            `/reports/${report.ident}/summary/pathway-analysis`,
          ).request();
          setPathwayImage(pathwayImageResp);

          const type = pathwayImageResp?.legend;
          if (type === 'v1') {
            setLegend('img/pathway_legend_v1.png');
          } else if (type === 'v2') {
            setLegend('img/pathway_legend_v2.png');
          } else if (type === 'v3') {
            setLegend('img/pathway_legend_v3.png');
          } else if (type === 'custom') {
            const legendResp = await api.get(
              `/reports/${report.ident}/image/retrieve/pathwayAnalysis.legend`,
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
  }, [loadedDispatch, report, setIsLoading]);

  const handlePathwayChange = useCallback(async (newPathway) => {
    if (!legend) {
      const type = newPathway?.legend;
      if (type === 'v1') {
        setLegend('img/pathway_legend_v1.png');
      } else if (type === 'v2') {
        setLegend('img/pathway_legend_v2.png');
      } else if (type === 'v3') {
        setLegend('img/pathway_legend_v3.png');
      } else if (type === 'custom') {
        const legendResp = await api.get(
          `/reports/${report.ident}/image/retrieve/pathwayAnalysis.legend`,
        ).request();
        setLegend(legendResp[0]);
      }
    }
  }, [legend, report]);

  return (
    <div className={`pathway ${isPrint ? 'pathway--print' : ''}`}>
      <Typography variant="h3">Pathway Analysis</Typography>
      <DemoDescription>
        This section is for display of a graphical or visual summary of the sequencing results in the context of biological pathways. This enables the visualization of multiple genomic alterations affecting often diverse biological pathways.
      </DemoDescription>
      {!isLoading && (
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
      )}
    </div>
  );
};

export default withLoading(PathwayAnalysis);
