import React, {
  useContext, useEffect, useCallback,
} from 'react';
import {
  Typography,
} from '@mui/material';
import { useQueryClient } from 'react-query';

import snackbar from '@/services/SnackbarUtils';
import { ImageType } from '@/components/Image';
import ReportContext from '@/context/ReportContext';
import { queryKeys } from '@/queries/queryKeys';
import { useReportSummaryPathwayAnalysis, useReportImageRetrieveKey } from '@/queries/get';
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
  const queryClient = useQueryClient();

  const {
    data: pathwayImage,
    isLoading: isPathwayLoading,
    isError: isPathwayError,
    error: pathwayError,
  } = useReportSummaryPathwayAnalysis<PathwayImageType>(report?.ident, {
    enabled: !!report?.ident,
  });

  const {
    data: legend = null,
    isLoading: isLegendLoading,
    isError: isLegendError,
    error: legendError,
  } = useReportImageRetrieveKey<ImageType[], ImageType | null>(report?.ident, LEGEND_IMAGE_KEY, {
    enabled: !!report?.ident,
    select: (data) => data?.[0] ?? null,
  });

  const isApiLoading = isPathwayLoading || isLegendLoading;

  useEffect(() => {
    if (isPathwayError || isLegendError) {
      snackbar.error(`Network error: ${pathwayError ?? legendError}`);
    }
  }, [isPathwayError, isLegendError, pathwayError, legendError]);

  useEffect(() => {
    if (report && !isApiLoading) {
      setIsLoading(false);
      if (loadedDispatch) {
        loadedDispatch({ type: 'pathway' });
      }
    }
  }, [report, isApiLoading, loadedDispatch, setIsLoading]);

  const handlePathwayChange = useCallback((newPathway: PathwayImageType) => {
    if (report) {
      queryClient.setQueryData(
        queryKeys.reports.reportSummaryPathwayAnalysis(report.ident),
        newPathway,
      );
    }
  }, [queryClient, report]);

  return (
    <div className={`pathway ${isPrint ? 'pathway--print' : ''}`}>
      <Typography variant="h3">Pathway Analysis</Typography>
      <DemoDescription>
        This section is for display of a graphical or visual summary of the sequencing results in the context of biological pathways. This enables the visualization of multiple genomic alterations affecting often diverse biological pathways.
      </DemoDescription>
      {!isLoading && !isApiLoading && (isPrint ? (
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
