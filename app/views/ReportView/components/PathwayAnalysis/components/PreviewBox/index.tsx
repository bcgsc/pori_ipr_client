import React from 'react';
import { Box } from '@mui/material';

type PreviewBoxProps = {
  children: React.ReactNode;
  // 'empty' shows a dashed placeholder frame; 'filled' a solid frame around an image.
  variant?: 'empty' | 'filled';
  // When true, content taller than the square scrolls instead of being clipped.
  scrollable?: boolean;
};

// Fixed square preview area — its height tracks its width (aspect-ratio 1) so the
// pathway and legend previews are the same size whether or not an image is present.
// The section's max-width caps the square at 500px.
const PreviewBox = ({
  children,
  variant = 'filled',
  scrollable = false,
}: PreviewBoxProps): JSX.Element => (
  <Box
    sx={{
      position: 'relative',
      width: '100%',
      aspectRatio: '1 / 1',
      display: 'flex',
      // Top-align when scrollable so overflowing content stays reachable
      // (centering would push the top out of view and make it unscrollable).
      alignItems: scrollable ? 'flex-start' : 'center',
      justifyContent: 'center',
      overflow: scrollable ? 'auto' : 'hidden',
      borderWidth: 1,
      borderStyle: variant === 'empty' ? 'dashed' : 'solid',
      borderColor: 'divider',
      borderRadius: 1,
    }}
  >
    {children}
  </Box>
);

export default PreviewBox;
