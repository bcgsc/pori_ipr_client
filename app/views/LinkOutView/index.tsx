import React, { useEffect, useState } from 'react';

import { Typography } from '@mui/material';

const LinkOutView = (): JSX.Element => {
  const [error, setError] = useState();

  useEffect(() => {
    try {
      const [link] = window.location.href.match(/(?<=\/graphkb).+/g);
      window.location.assign(`${window._env_.GRAPHKB_URL}${link}`);
    } catch (err) {
      setError(err);
    }
  }, []);

  return (
    <Typography align="center">
      {error ? (
        <>
          {`An error has occured redirecting to GraphKB: ${error.message}`}
        </>
      ) : (
        <>
          Redirecting...
        </>
      )}
    </Typography>
  );
};

export default LinkOutView;
