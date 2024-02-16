import React from 'react';
import {
  IconButton,
  Typography,
} from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

import useReport from '@/hooks/useReport';
import SlideType from '../../types';

type SlideProps = {
  slide: SlideType;
  onDelete?: () => void;
  isPrint?: boolean;
};

const Slide = ({
  slide,
  onDelete = () => {},
  isPrint = false,
}: SlideProps): JSX.Element => {
  const { canEdit } = useReport();

  return (
    <div className="slides__slide-content">
      <Typography variant="h4" className="slides__title">
        {slide.name}
      </Typography>
      <div className="slides__slide-container">
        <img
          alt={slide.name}
          className="slides__image"
          src={`data:${slide.object_type};base64, ${slide.object}`}
        />
        {canEdit && !isPrint && (
          <IconButton
            className="slides__slide-action"
            onClick={onDelete}
            size="small"
          >
            <HighlightOffIcon />
          </IconButton>
        )}
      </div>
    </div>
  );
};

export default Slide;
