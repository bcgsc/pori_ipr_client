import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@material-ui/core';

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
  } = props;

  return (
    <>
      {data && (
        <>
          {showTitle && (
            <Typography>
              {title}
            </Typography>
          )}
          <img
            src={`data:image/${format};base64,${data}`}
            alt={title}
            key={key}
          />
          {showCaption && (
            <Typography>
              {caption}
            </Typography>
          )}
        </>
      )}
    </>
  );
};

Image.propTypes = {
  image: PropTypes.objectOf(PropTypes.string).isRequired,
  showTitle: PropTypes.bool,
  showCaption: PropTypes.bool,
};

Image.defaultProps = {
  showTitle: false,
  showCaption: false,
};

export default Image;
