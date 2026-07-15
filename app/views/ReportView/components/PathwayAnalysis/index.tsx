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
import PageBreak from '@/components/PageBreak';
import PathwayImageType from './types';
import Legend, { LEGEND_IMAGE_KEY } from './components/Legend';
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
  const [legend, setLegend] = useState<ImageType | null>(null);

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const [pathwayImageResp, legendResp] = await Promise.all([
            api.get(`/reports/${report.ident}/summary/pathway-analysis`).request(),
            api.get(`/reports/${report.ident}/image/retrieve/${LEGEND_IMAGE_KEY}`).request(),
          ]);
          setPathwayImage(pathwayImageResp);
          setLegend(legendResp?.[0] ?? null);
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

  const handlePathwayChange = useCallback((newPathway: PathwayImageType) => {
    setPathwayImage(newPathway);
  }, []);

  return (
    <div className={`pathway ${isPrint ? 'pathway--print' : ''}`}>
      <Typography variant="h3">Pathway Analysis</Typography>
      <DemoDescription>
        This section is for display of a graphical or visual summary of the sequencing results in the context of biological pathways. This enables the visualization of multiple genomic alterations affecting often diverse biological pathways.
      </DemoDescription>
      {!isLoading && (isPrint ? (
        <>
          <Pathway
            initialPathway={pathwayImage}
            isPrint
            onChange={handlePathwayChange}
          />
          <PageBreak />
          <Legend
            initialLegend={legend}
            isPrint
          />
        </>
      ) : (
        <div className="pathway__content">
          <div className="pathway__section">
            <Pathway
              initialPathway={pathwayImage}
              onChange={handlePathwayChange}
            />
          </div>
          <div className="pathway__section">
            <Legend initialLegend={legend} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default withLoading(PathwayAnalysis);
