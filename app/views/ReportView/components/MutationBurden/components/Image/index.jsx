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
  } = props;

  return (
    <>
      {data && (
        <>
          <Typography>
            {title}
          </Typography>
          <img
            src={`data:image/${format};base64,${data}`}
            alt={title}
            key={key}
          />
          <Typography>
            {caption}
          </Typography>
        </>
      )}
    </>
  );
};

Image.propTypes = {
  image: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default Image;
