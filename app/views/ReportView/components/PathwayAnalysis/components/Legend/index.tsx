import React, {
  useContext, useCallback, useState, useEffect,
} from 'react';
import {
  IconButton, Typography, Button, CircularProgress,
} from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PublishIcon from '@mui/icons-material/Publish';
import { useSnackbar } from 'notistack';
import useConfirmDialog from '@/hooks/useConfirmDialog';

import api from '@/services/api';
import useReport from '@/hooks/useReport';
import ReportContext from '@/context/ReportContext';
import ConfirmContext from '@/context/ConfirmContext';
import Image, { ImageType } from '@/components/Image';

type LegendProps = {
  initialLegend: null | string | ImageType;
  type: string;
  isPrint?: boolean;
};

const Legend = ({
  initialLegend,
  type,
  isPrint = false,
}: LegendProps): JSX.Element => {
  const { canEdit } = useReport();
  const { report } = useContext(ReportContext);
  const { isSigned } = useContext(ConfirmContext);
  const { showConfirmDialog } = useConfirmDialog();
  const snackbar = useSnackbar();

  const [imageError, setImageError] = useState('');
  const [isLegendLoading, setIsLegendLoading] = useState(false);
  const [legend, setLegend] = useState<string | ImageType>();

  useEffect(() => {
    if (initialLegend) {
      setLegend(initialLegend);
    }
  }, [initialLegend]);

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

      const imageAPICall = api.post(`/reports/${report.ident}/image`, newLegend, {}, true);

      if (isSigned) {
        showConfirmDialog(imageAPICall);
      } else {
        await imageAPICall.request();
        const resp = await api.get(
          `/reports/${report.ident}/image/retrieve/pathwayAnalysis.legend`,
          {},
        ).request();
        setLegend(resp[0]);
        snackbar.enqueueSnackbar('Pathway image uploaded successfully', { variant: 'success' });
      }
    } catch (err) {
      snackbar.enqueueSnackbar(`Error uploading pathway image: ${err}`, { variant: 'error' });
    } finally {
      setIsLegendLoading(false);
    }
  }, [isSigned, report, snackbar, showConfirmDialog]);

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
    <div>
      {imageError && (
        <Typography align="center" color="error">{imageError}</Typography>
      )}
      {/* Case where v1 or v2 legend is used */}
      {legend && typeof legend === 'string' && (
        <img src={legend} className="pathway__legend" alt="Pathway Legend" />
      )}
      {/* Case where a custom legend is used */}
      {legend && typeof legend === 'object' && (
        <>
          {canEdit && (
            <IconButton
              className="pathway__button"
              component="label"
              color="secondary"
              onClick={handleDeleteLegend}
              size="large"
            >
              <HighlightOffIcon />
            </IconButton>
          )}
          <Image className="pathway__legend-image" image={legend} />
        </>
      )}
      {/* Case where a custom legend is used but hasn't been uploaded yet */}
      {!legend && type === 'custom' && !isPrint && canEdit && (
        <Button
          className="pathway__legend-button"
          component="label"
          color="secondary"
          variant="outlined"
        >
          {!isLegendLoading && (
            <>
              Upload Pathway Legend
              <PublishIcon />
              <input
                accept=".png,.jpg,.jpeg"
                onChange={handleLegendUpload}
                type="file"
                hidden
              />
            </>
          )}
          {isLegendLoading && (
            <CircularProgress color="secondary" />
          )}
        </Button>
      )}
    </div>
  );
};

export default Legend;
