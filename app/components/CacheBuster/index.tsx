import React, { useEffect } from 'react';

const CacheBuster = ({
  children,
}) => {
  useEffect(() => {
    const delCaches = async () => {
      if ('caches' in window) {
        const cacheKeys = await caches.keys();

        if (cacheKeys.length) {
          cacheKeys.forEach(async (key) => caches.delete(key));
          window.location.reload();
        }
      }
    }
    delCaches();
  }, []);

  return children;
};

export default CacheBuster;
