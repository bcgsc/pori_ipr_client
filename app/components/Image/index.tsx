import React, { useState, useCallback } from 'react';
import { Typography, Fade, Button } from '@mui/material';

import ImageType from './types.d';

import './index.scss';

type ImageProps = {
  image?: ImageType;
  height?: number | string;
  width?: number | string;
  showTitle?: boolean;
  showCaption?: boolean;
  isZoomable?: boolean;
  /** Style to apply to img tag */
  imgStyle?: React.ComponentPropsWithoutRef<'img'>['style'];
};

const Image = ({
  image: {
    data,
    title,
    caption,
    format,
    key,
  } = {} as ImageType,
  height = undefined,
  width = undefined,
  showTitle = false,
  showCaption = false,
  isZoomable = true,
  imgStyle = {},
}: ImageProps): JSX.Element => {
  const [isZoomed, setIsZoomed] = useState(false);

  const handleZoom = useCallback(() => {
    if (isZoomable) {
      setIsZoomed((prevVal) => !prevVal);
    }
  }, [isZoomable]);

  if (data) {
    return (
      <>
        <div className="image">
          {showTitle && title && (
          <Typography variant="h3">
            {title}
          </Typography>
          )}
          <Button
            classes={{ root: 'image__button' }}
            component="label"
            onClick={handleZoom}
          >
            <img
              className={`image ${isZoomable && !isZoomed ? 'image__zoom--in' : ''}`}
              src={`data:image/${format};base64,${data}`}
              alt={title}
              key={key}
              height={Number.isInteger(height) ? `${height}px` : height}
              width={Number.isInteger(width) ? `${height}px` : width}
              style={imgStyle}
            />
          </Button>
          {showCaption && caption && (
          <Typography className="image__caption" variant="caption">
            {caption}
          </Typography>
          )}
        </div>
        {isZoomed && (
        <Fade in={isZoomed}>
          <button
            className="image__dialog-background"
            onClick={handleZoom}
            type="button"
          >
            <div
              className="image__dialog-button"
            >
              {showTitle && title && (
              <Typography variant="h3">
                {title}
              </Typography>
              )}
              <img
                className={`image__data ${isZoomable && isZoomed ? 'image__zoom--out' : ''}`}
                src={`data:image/${format};base64,${data}`}
                alt={title}
                key={key}
              />
              {showCaption && caption && (
              <Typography className="image__caption" variant="caption">
                {caption}
              </Typography>
              )}
            </div>
          </button>
        </Fade>
        )}
      </>
    );
  }
  return null;
};

export default Image;

export type { ImageType };
