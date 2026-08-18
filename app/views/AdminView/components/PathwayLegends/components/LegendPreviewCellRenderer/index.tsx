import React, { useState, useMemo, useCallback } from 'react';
import { Typography, ButtonBase } from '@mui/material';
import type { ICellRendererParams } from '@ag-grid-community/core';
import ImageViewer from '@/components/DataTable/components/ImageViewer';
import type { ImageType } from '@/components/Image';
import legendDataUri, { legendMimeSubtype } from '../../legendImage';
import type { PathwayLegendRecord } from '../AddEditPathwayLegend';

// Cap the preview at half the viewport, but never let it overflow its own cell.
const PREVIEW_MAX_WIDTH = 'min(500px, 50vw)';

const LegendPreviewCellRenderer = (
  { data }: ICellRendererParams<PathwayLegendRecord>,
): JSX.Element => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const src = legendDataUri(data ?? {});

  // ImageViewer -> Image renders `data:image/${format};base64,${data}`, so it needs
  // bare base64 in `data` and a normalized mime subtype in `format`.
  const viewerImage = useMemo<ImageType>(() => ({
    data: data?.data ?? '',
    format: legendMimeSubtype(data ?? {}),
    filename: data?.filename ?? '',
    title: data?.name ?? null,
    caption: null,
    key: data?.ident ?? '',
  } as ImageType), [data]);

  const handleOpen = useCallback(() => setIsViewerOpen(true), []);
  const handleClose = useCallback(() => setIsViewerOpen(false), []);

  if (!src) {
    return <Typography variant="caption" color="text.secondary">No image</Typography>;
  }

  return (
    <>
      <ButtonBase
        onClick={handleOpen}
        title="Click to enlarge"
        sx={{ maxWidth: PREVIEW_MAX_WIDTH, display: 'block' }}
      >
        <img
          src={src}
          alt={data?.name ?? data?.filename ?? 'Pathway legend preview'}
          style={{
            display: 'block',
            maxWidth: '100%',
            height: 'auto',
            objectFit: 'contain',
          }}
        />
      </ButtonBase>
      {isViewerOpen && (
        <ImageViewer
          isOpen={isViewerOpen}
          selectedRow={{ image: viewerImage }}
          onClose={handleClose}
        />
      )}
    </>
  );
};

export default LegendPreviewCellRenderer;
