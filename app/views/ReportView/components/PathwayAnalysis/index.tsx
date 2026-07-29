import React, {
  useContext, useEffect, useCallback, useState,
} from 'react';
import {
  Typography,
} from '@mui/material';
import { useQueryClient } from 'react-query';

import snackbar from '@/services/SnackbarUtils';
import { ImageType } from '@/components/Image';
import ReportContext from '@/context/ReportContext';
import { queryKeys } from '@/queries/queryKeys';
import { useReportSummaryPathwayAnalysis, useLegend } from '@/queries/get';
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
  isPrint = false,
  loadedDispatch,
  setIsLoading,
}: PathwayAnalysisProps): JSX.Element => {
  const { report } = useContext(ReportContext);
  const queryClient = useQueryClient();

  const {
    data: pathwayImage,
    isLoading: isPathwayLoading,
    isError: isPathwayError,
    error: pathwayError,
  } = useReportSummaryPathwayAnalysis<PathwayImageType>(report?.ident, {
    enabled: Boolean(report?.ident),
  });

  const {
    data: legend = null,
    isLoading: isLegendLoading,
    isError: isLegendError,
    error: legendError,
  } = useLegend<ImageType[], ImageType | null>(String(pathwayImage?.legendId), {
    enabled: Boolean(report?.ident) && Boolean(pathwayImage?.legendId),
  });

  const isApiLoading = isPathwayLoading || isLegendLoading;

  const [isPathwayRendered, setIsPathwayRendered] = useState(false);
  const handlePathwayRendered = useCallback(() => {
    setIsPathwayRendered(true);
  }, []);
  const hasPathwaySvg = Boolean(pathwayImage?.pathway);
  // For print we must wait for the pathway SVG to actually render before
  // reporting the section as loaded, otherwise paged.js snapshots it mid-load
  // and freezes the loading bar into the printed page. On screen, and when
  // there is no SVG to draw, readiness follows the API call alone.
  const isPathwayReady = !isPrint || !hasPathwaySvg || isPathwayRendered;

  useEffect(() => {
    if (isPathwayError || isLegendError) {
      snackbar.error(`Network error: ${pathwayError ?? legendError}`);
    }
  }, [isPathwayError, isLegendError, pathwayError, legendError]);

  useEffect(() => {
    if (report && !isApiLoading && isPathwayReady) {
      setIsLoading(false);
      if (loadedDispatch) {
        loadedDispatch({ type: 'pathway-analysis' });
      }
    }
  }, [report, isApiLoading, isPathwayReady, loadedDispatch, setIsLoading]);

  const handlePathwayChange = useCallback((newPathway: PathwayImageType) => {
    if (report) {
      queryClient.setQueryData(
        queryKeys.reports.reportSummaryPathwayAnalysis(report.ident),
        newPathway,
      );
    }
  }, [queryClient, report]);

  return (
    <div className={`pathway ${isPrint ? 'pathway--print' : 'pathway'}`}>
      <Typography variant="h3">Pathway Analysis</Typography>
      <DemoDescription>
        This section is for display of a graphical or visual summary of the sequencing results in the context of biological pathways. This enables the visualization of multiple genomic alterations affecting often diverse biological pathways.
      </DemoDescription>
      {report && !isApiLoading && (isPrint ? (
        <div className="pathway__content">
          <Pathway
            initialPathway={pathwayImage}
            isPrint
            onChange={handlePathwayChange}
            onRender={handlePathwayRendered}
          />
          <Legend
            initialLegend={legend}
            isPrint
          />
        </div>
      ) : (
        <div className="pathway__content">
          <div className="pathway__section">
            <Pathway
              initialPathway={pathwayImage}
              onChange={handlePathwayChange}
              onRender={handlePathwayRendered}
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
