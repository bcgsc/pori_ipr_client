import React, { useEffect } from 'react';

const LinkOutView = () => {
  useEffect(() => {
    const [link] = window.location.href.match(/(?<=\/graphkb).+/g);
    window.location.assign(`${CONFIG.ENDPOINTS.GRAPHKB}${link}`);
  }, []);

  return (
    <div>
      Redirecting...
    </div>
  );
};

export default LinkOutView;
