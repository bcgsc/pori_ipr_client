import React, { useEffect, useState } from 'react';

const LinkOutView = () => {
  const [error, setError] = useState();

  useEffect(() => {
    try {
      const [link] = window.location.href.match(/(?<=\/graphkb).+/g);
      window.location.assign(`${CONFIG.ENDPOINTS.GRAPHKB}${link}`);
    } catch (err) {
      setError(err);
    }
  }, []);

  return (
    <>
      {error ? (
        <div>
          An error has occured redirecting to GraphKB:
          {error}
        </div>
      ) : (
        <div>
          Redirecting...
        </div>
      )}
    </>
  );
};

export default LinkOutView;
