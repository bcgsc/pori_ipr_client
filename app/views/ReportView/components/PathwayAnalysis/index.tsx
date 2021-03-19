import React, {
  useState, useContext, useEffect, useCallback,
} from 'react';
import { useSnackbar } from 'notistack';
import {
  Typography,
  Button,
  IconButton,
  LinearProgress,
  CircularProgress,
} from '@material-ui/core';
import PublishIcon from '@material-ui/icons/Publish';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

import api from '@/services/api';
import Image from '@/components/Image';
import ReportContext from '@/components/ReportContext';
import SvgImage from '@/components/SvgImage';
import EditContext from '@/components/EditContext';
import ConfirmContext from '@/components/ConfirmContext';
import AsyncButton from '@/components/AsyncButton';
import { ImageType } from '@/common';
import PathwayImageType from './types';

import './index.scss';

type PathwayAnalysisProps = {
  isPrint?: boolean;
  loadedDispatch?: (type: Record<'type', string>) => void;
};

const PathwayAnalysis = ({
  isPrint = false,
  loadedDispatch,
}: PathwayAnalysisProps): JSX.Element => {
  const snackbar = useSnackbar();
  const { report } = useContext(ReportContext);
  const { canEdit } = useContext(EditContext);
  const { isSigned } = useContext(ConfirmContext);

  const [pathwayImage, setPathwayImage] = useState<PathwayImageType>();
  const [legend, setLegend] = useState<string | ImageType>();
  const [imageError, setImageError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPathwayLoading, setIsPathwayLoading] = useState(false);
  const [isLegendLoading, setIsLegendLoading] = useState(false);

  useEffect(() => {
    if (report) {
      const getData = async () => {
        const pathwayImageResp = await api.get(
          `/reports/${report.ident}/summary/pathway-analysis`,
          {},
        ).request();
        setPathwayImage(pathwayImageResp);

        pathwayImageResp.legend = 'custom';
        if (pathwayImageResp?.legend === 'v1') {
          setLegend('img/pathway_legend_v1.png');
        } else if (pathwayImageResp?.legend === 'v2') {
          setLegend('img/pathway_legend_v2.png');
        } else if (pathwayImageResp?.legend === 'custom') {
          const legendResp = await api.get(
            `/reports/${report.ident}/image/retrieve/pathwayAnalysis.legend`,
            {},
          ).request();
          setLegend(legendResp['pathwayAnalysis.legend']);
        }
        setIsLoading(false);
        if (loadedDispatch) {
          loadedDispatch({ type: 'pathway' });
        }
      };
      getData();
    }
  }, [loadedDispatch, report]);

  const handlePathwayUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { files },
    } = event;
    const [uploadedFile] = files;
    if (!uploadedFile.name.match(/\.svg$/)) {
      setImageError('Please select a valid image (.svg)');
      return;
    }
    setIsPathwayLoading(true);
    setImageError('');

    try {
      const newPathway = new FormData();

      newPathway.append('pathway', uploadedFile);

      const pathwayResp = await api.put(
        `/reports/${report.ident}/summary/pathway-analysis`,
        newPathway,
        {},
        true,
      ).request(isSigned);
      
      setPathwayImage(pathwayResp);
      setIsPathwayLoading(false);
      snackbar.enqueueSnackbar('Pathway image uploaded successfully', { variant: 'success' });
    } catch (err) {
      snackbar.enqueueSnackbar(`Error uploading pathway image: ${err}`, { variant: 'error' });
    }
  }, [isSigned, report, snackbar]);

  const handleLegendUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { files },
    } = event;
    const [uploadedFile] = files;
    if (!uploadedFile.name.match(/\.(png|jpe?g)$/)) {
      setImageError('Please select a valid image (.png, .jpg)');
      return;
    }
    setIsLegendLoading(true);
    setImageError('');

    try {
      const newLegend = new FormData();
      newLegend.append('pathwayAnalysis.legend', uploadedFile);

      await api.post(`/reports/${report.ident}/image`, newLegend, {}, true).request(isSigned);

      const resp = await api.get(
        `/reports/${report.ident}/image/retrieve/pathwayAnalysis.legend`,
        {},
      ).request();
      setLegend(resp['pathwayAnalysis.legend']);

      setIsLegendLoading(false);
      snackbar.enqueueSnackbar('Pathway image uploaded successfully', { variant: 'success' });
    } catch (err) {
      snackbar.enqueueSnackbar(`Error uploading pathway image: ${err}`, { variant: 'error' });
    }
  }, [isSigned, report, snackbar]);

  const handleDeleteLegend = useCallback(async () => {
    try {
      await api.del(`/reports/${report.ident}/image/${legend.ident}`, {}, {}).request();
      setLegend(null);
      snackbar.enqueueSnackbar('Legend deleted', { variant: 'success' });
    } catch (err) {
      snackbar.enqueueSnackbar(`Error removing legend: ${err}`, { variant: 'error' });
    }
  }, [report, legend, snackbar]);

  return (
    <div className="pathway">
      <Typography variant="h3">Pathway Analysis</Typography>
      {!isLoading ? (
        <>
          {canEdit && !isPrint && (
            <>
              {pathwayImage?.pathway ? (
                <IconButton
                  className="pathway__button"
                  color="secondary"
                  component="label"
                >
                  <PublishIcon />
                  <input
                    accept=".svg"
                    onChange={handlePathwayUpload}
                    type="file"
                    hidden
                  />
                </IconButton>
              ) : (
                <Button
                  className="pathway__legend-button"
                  component="label"
                  color="secondary"
                  variant="outlined"
                >
                  {isPathwayLoading ? (
                    <CircularProgress color="secondary" />
                  ) : (
                    <>
                      Upload Pathway Image
                      <PublishIcon />
                      <input
                        accept=".svg"
                        onChange={handlePathwayUpload}
                        type="file"
                        hidden
                      />
                    </>
                  )}
                </Button>
              )}
            </>
          )}
          {pathwayImage?.pathway && (
            <SvgImage image={pathwayImage.pathway} isPrint={isPrint} />
          )}
          {!pathwayImage && !canEdit && (
            <Typography variant="h5" align="center">Pathway Not Yet Analyzed</Typography>
          )}
          {/* Case where v1 or v2 legend is used */}
          {legend && typeof legend === 'string' && (
            <img src={legend} className="pathway__legend" alt="Pathway Legend" />
          )}
          {/* Case where a custom legend is used */}
          {legend && typeof legend === 'object' && (
            <>
              <IconButton
                className="pathway__button"
                component="label"
                color="secondary"
                onClick={handleDeleteLegend}
              >
                <HighlightOffIcon />
              </IconButton>
              <Image className="pathway__legend-image" image={legend} />
            </>
          )}
          {/* Case where a custom legend is used but hasn't been uploaded yet */}
          {!legend && pathwayImage?.legend === 'custom' && !isPrint && (
            <AsyncButton
              className="pathway__legend-button"
              component="label"
              color="secondary"
              isLoading={isLegendLoading}
              variant="outlined"
            >
              Upload Pathway Legend
              <PublishIcon />
              <input
                accept=".png,.jpg,.jpeg"
                onChange={handleLegendUpload}
                type="file"
                hidden
              />
            </AsyncButton>
          )}
        </>
      ) : (
        <LinearProgress />
      )}
    </div>
  );
};

export default PathwayAnalysis;
