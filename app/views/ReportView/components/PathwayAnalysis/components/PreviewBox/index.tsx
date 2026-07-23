import React from 'react';
import { Box } from '@mui/material';

type PreviewBoxProps = {
  children: React.ReactNode;
  // 'empty' shows a dashed placeholder frame; 'filled' a solid frame around an image.
  variant?: 'empty' | 'filled';
  // When true, content taller than the box scrolls instead of being clipped.
  scrollable?: boolean;
};

// Preview container that scales to fit the available width; height is determined
// by the content (the SVG viewer or image).
const PreviewBox = ({
  children,
  variant = 'filled',
  scrollable = false,
}: PreviewBoxProps): JSX.Element => (
  <Box
    sx={{
      position: 'relative',
      width: '100%',
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
