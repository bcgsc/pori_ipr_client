import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Typography, Fade } from '@material-ui/core';

import './index.scss';

const Image = (props) => {
  const {
    image: {
      data,
      title,
      caption,
      format,
      key,
    },
    showTitle,
    showCaption,
    isZoomable,
  } = props;

  const [isZoomed, setIsZoomed] = useState(false);

  const handleZoom = useCallback(() => {
    if (isZoomable) {
      setIsZoomed(prevVal => !prevVal);
    }
  }, [isZoomable]);

  return (
    <>
      {data && (
        <>
          <span>
            {showTitle && (
              <Typography variant="h3">
                {title}
              </Typography>
            )}
            <img
              className={`${isZoomable && !isZoomed ? 'image__zoom--in' : ''}`}
              src={`data:image/${format};base64,${data}`}
              alt={title}
              key={key}
              onClick={handleZoom}
            />
            {showCaption && (
              <Typography className="image__caption" variant="caption">
                {caption}
              </Typography>
            )}
          </span>
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

Image.propTypes = {
  image: PropTypes.objectOf(PropTypes.string).isRequired,
  showTitle: PropTypes.bool,
  showCaption: PropTypes.bool,
  isZoomable: PropTypes.bool,
};

Image.defaultProps = {
  showTitle: false,
  showCaption: false,
  isZoomable: true,
};

export default Image;
