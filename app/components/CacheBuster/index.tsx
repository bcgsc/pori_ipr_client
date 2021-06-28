import React, { useEffect } from 'react';

const CacheBuster = ({
  children,
}) => {
  useEffect(() => {
    const delCaches = async () => {
      const cacheKeys = await caches.keys();
      if ('caches' in window && cacheKeys.length) {
        cacheKeys.forEach(async (key) => caches.delete(key));
        window.location.reload();
      }
    }
    delCaches();
  }, []);

  return children;
};

export default CacheBuster;
