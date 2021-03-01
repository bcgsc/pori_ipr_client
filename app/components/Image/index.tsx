import React, { useState, useCallback } from 'react';
import { Typography, Fade } from '@material-ui/core';

import ImageType from './types';

import './index.scss';

type ImageProps = {
  image: ImageType;
  height?: number;
  width?: number;
  showTitle?: boolean;
  showCaption?: boolean;
  isZoomable?: boolean;
};

const Image = ({
  image: {
    data,
    title,
    caption,
    format,
    key,
  },
  height = 0,
  width = 0,
  showTitle = false,
  showCaption = false,
  isZoomable = true,
}: ImageProps): JSX.Element => {
  const [isZoomed, setIsZoomed] = useState(false);

  const handleZoom = useCallback(() => {
    if (isZoomable) {
      setIsZoomed((prevVal) => !prevVal);
    }
  }, [isZoomable]);

  return (
    <>
      {data && (
        <>
          <div>
            {showTitle && (
              <Typography variant="h3">
                {title}
              </Typography>
            )}
            <img
              className={`image ${isZoomable && !isZoomed ? 'image__zoom--in' : ''}`}
              src={`data:image/${format};base64,${data}`}
              alt={title}
              key={key}
              onClick={handleZoom}
              onKeyUp={handleZoom}
              height={height ? `${height}px` : undefined}
              width={width ? `${width}px` : undefined}
            />
            {showCaption && (
              <Typography className="image__caption" variant="caption">
                {caption}
              </Typography>
            )}
          </div>
          <Fade in={isZoomed}>
            <div className="image__dialog-background" onClick={handleZoom} onKeyUp={handleZoom} role="dialog">
              <div className="image__dialog">
                {showTitle && (
                  <Typography variant="h3">
                    {title}
                  </Typography>
                )}
                <img
                  className={`${isZoomable && isZoomed ? 'image__zoom--out' : ''}`}
                  src={`data:image/${format};base64,${data}`}
                  alt={title}
                  key={key}
                />
                {showCaption && (
                  <Typography className="image__caption" variant="caption">
                    {caption}
                  </Typography>
                )}
              </div>
            </div>
          </Fade>
        </>
      )}
    </>
  );
};

export default Image;
