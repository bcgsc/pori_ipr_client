import React, {
  useContext, useCallback, useState, useEffect,
} from 'react';
import {
  IconButton, Typography, Button, ButtonBase,
} from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PublishIcon from '@mui/icons-material/Publish';

import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import useReport from '@/hooks/useReport';
import ReportContext from '@/context/ReportContext';
import ConfirmContext from '@/context/ConfirmContext';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import Image, { ImageType } from '@/components/Image';
import ImageViewer from '@/components/DataTable/components/ImageViewer';
import AddPathwayLegend, { LEGEND_IMAGE_KEY } from '../AddPathwayLegend';
import PreviewBox from '../PreviewBox';

type LegendProps = {
  initialLegend: ImageType | null;
  isPrint?: boolean;
};

const Legend = ({
  initialLegend,
  isPrint = false,
}: LegendProps): JSX.Element => {
  const { canEdit } = useReport();
  const { report } = useContext(ReportContext);
  const { isSigned } = useContext(ConfirmContext);
  const { showConfirmDialog } = useConfirmDialog();

  const [legend, setLegend] = useState<ImageType | null>(initialLegend);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    setLegend(initialLegend);
  }, [initialLegend]);

  const handleDialogClose = useCallback((savedLegend?: ImageType | null) => {
    if (savedLegend !== undefined) {
      setLegend(savedLegend);
    }
    setIsDialogOpen(false);
  }, []);

  const handleDeleteLegend = useCallback(async () => {
    if (!legend) {
      return;
    }
    const deleteCall = api.del(`/reports/${report.ident}/image/${legend.ident}`, {}, {});
    if (isSigned) {
      showConfirmDialog(deleteCall);
      return;
    }
    try {
      await deleteCall.request();
      setLegend(null);
      snackbar.success('Legend deleted');
    } catch (err) {
      snackbar.error(`Error removing legend: ${err}`);
    }
  }, [report, legend, isSigned, showConfirmDialog]);

  let previewNode: JSX.Element;
  if (legend && isPrint) {
    previewNode = <Image image={legend} />;
  } else if (legend) {
    previewNode = (
      <PreviewBox variant="filled">
        {canEdit && (
          <IconButton
            color="secondary"
            onClick={handleDeleteLegend}
            size="small"
            sx={{ position: 'absolute', top: 4, right: 4 }}
          >
            <HighlightOffIcon />
          </IconButton>
        )}
        <ButtonBase
          onClick={() => setIsViewerOpen(true)}
          title="Click to enlarge"
          sx={{
            height: '100%',
            maxWidth: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={`data:image/${legend.format};base64,${legend.data}`}
            alt="Pathway legend"
            style={{
              maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', cursor: 'zoom-in',
            }}
          />
        </ButtonBase>
      </PreviewBox>
    );
  } else if (isPrint) {
    previewNode = <Typography align="center">No legend image</Typography>;
  } else {
    previewNode = (
      <PreviewBox variant="empty">
        <Typography align="center" color="text.secondary">No legend image</Typography>
      </PreviewBox>
    );
  }

  return (
    <div>
      {previewNode}

      {canEdit && !isPrint && (
        <Button
          color="secondary"
          variant="outlined"
          startIcon={<PublishIcon />}
          onClick={() => setIsDialogOpen(true)}
          sx={{ mt: 2 }}
        >
          Upload custom legend
        </Button>
      )}

      {isViewerOpen && legend && (
        <ImageViewer
          isOpen={isViewerOpen}
          selectedRow={{ image: legend }}
          onClose={() => setIsViewerOpen(false)}
        />
      )}

      <AddPathwayLegend
        isOpen={isDialogOpen}
        existingLegend={legend}
        onClose={handleDialogClose}
      />
    </div>
  );
};

export default Legend;
export { LEGEND_IMAGE_KEY };
