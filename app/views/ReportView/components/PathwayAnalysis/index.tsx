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

import api from '@/services/api';
import Image from '@/components/Image';
import ReportContext from '@/components/ReportContext';
import SvgImage from '@/components/SvgImage';
import EditContext from '@/components/EditContext';
import ConfirmContext from '@/components/ConfirmContext';
import AsyncButton from '@/components/AsyncButton';

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

  const [pathwayImage, setPathwayImage] = useState<Record<string, unknown>>();
  const [legend, setLegend] = useState<string | Record<string, unknown>>();
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

        if (pathwayImageResp?.legend === 'v1') {
          setLegend('img/pathway_legend.png');
        } else if (pathwayImageResp?.legend === 'v2') {
          setLegend('img/pathway_legend.png');
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
    console.log(files);
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

      let resp;
      if (pathwayImage) {
        resp = await api.put(
          `/reports/${report.ident}/summary/pathway-analysis`,
          newPathway,
          {},
          true,
        ).request(isSigned);
      } else {
        resp = await api.post(
          `/reports/${report.ident}/summary/pathway-analysis`,
          newPathway,
          {},
          true,
        ).request(isSigned);
      }
      setPathwayImage(resp);
      setIsPathwayLoading(false);
      snackbar.enqueueSnackbar('Pathway image uploaded successfully', { variant: 'success' });
    } catch (err) {
      snackbar.enqueueSnackbar(`Error uploading pathway image: ${err}`, { variant: 'error' });
    }
  }, [isSigned, pathwayImage, report, snackbar]);

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
                  component="label"
                  color="secondary"
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
              >
                <PublishIcon />
                <input
                  accept=".png,.jpg,.jpeg"
                  onChange={handleLegendUpload}
                  type="file"
                  hidden
                />
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
