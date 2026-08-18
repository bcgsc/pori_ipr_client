import React, {
  useContext, useCallback, useState, useEffect,
} from 'react';
import {
  Box, IconButton, Typography, Button, ButtonBase,
} from '@mui/material';
import { useQueryClient } from 'react-query';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PublishIcon from '@mui/icons-material/Publish';

import api, { ApiCallSet } from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import useReport from '@/hooks/useReport';
import ReportContext from '@/context/ReportContext';
import ConfirmContext from '@/context/ConfirmContext';
import useConfirmDialog from '@/hooks/useConfirmDialog';
import Image from '@/components/Image';
import ImageViewer from '@/components/DataTable/components/ImageViewer';
import { queryKeys } from '@/queries/queryKeys';
import AddPathwayLegend, { LEGEND_IMAGE_KEY } from '../AddPathwayLegend';
import PreviewBox from '../PreviewBox';
import { LegendImageType } from '../../types';

const DO_NOT_DELETE_LEGEND_NAMES = ['v1', 'v2', 'v3'];

type LegendProps = {
  initialLegend: LegendImageType | null;
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
  const queryClient = useQueryClient();

  const [legend, setLegend] = useState<LegendImageType | null>(initialLegend);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    setLegend(initialLegend);
  }, [initialLegend]);

  const handleDialogClose = useCallback((savedLegend?: boolean) => {
    if (savedLegend) {
      queryClient.invalidateQueries(queryKeys.reports.reportSummaryPathwayAnalysis(report.ident));
    }
    setIsDialogOpen(false);
  }, [queryClient, report.ident]);

  const handleDeleteLegend = useCallback(async () => {
    if (!legend) {
      return;
    }
    let deleteCall;
    if (DO_NOT_DELETE_LEGEND_NAMES.includes(legend.name)) {
      deleteCall = api.put(`/reports/${report.ident}/summary/pathway-analysis`, {
        legendId: null,
      }, {});
    } else {
      deleteCall = new ApiCallSet([
        api.del(`/legend/${legend.ident}`, {}, {}),
        api.put(`/reports/${report.ident}/summary/pathway-analysis`, { legendId: null }, {}),
      ]);
    }
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
            sx={{
              position: 'absolute', top: 4, right: 4, zIndex: '+1',
            }}
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
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            color="secondary"
            variant="outlined"
            startIcon={<PublishIcon />}
            onClick={() => setIsDialogOpen(true)}
          >
            Upload custom legend
          </Button>
        </Box>
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
        onClose={handleDialogClose}
      />
    </div>
  );
};

export default Legend;
export { LEGEND_IMAGE_KEY };
