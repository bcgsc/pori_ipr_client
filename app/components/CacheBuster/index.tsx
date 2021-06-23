import React, { useEffect } from 'react';

/* Credit to https://dev.to/flexdinesh/cache-busting-a-react-app-22lk */
// version from `meta.json` - first param
// version in bundle file - second param
const semverGreaterThan = (versionA, versionB) => {
  const versionsA = versionA.split(/\./g);
  const versionsB = versionB.split(/\./g);

  while (versionsA.length || versionsB.length) {
    const a = Number(versionsA.shift());
    const b = Number(versionsB.shift());

    if (a === b) {
      continue;
    }
    return a > b || isNaN(b);
  }
  return false;
};

const clearCacheAndReload = async () => {
  if ('caches' in window) {
    const cacheKeys = await caches.keys();
    cacheKeys.forEach(async (key) => caches.delete(key));
    window.location.reload();
  }
};

const CacheBuster = ({
  children,
}) => {
  useEffect(() => {
    const getData = async () => {
      const response = await fetch('meta.json');
      console.log(response.ok);
      if (response.ok) {
        const metaFile = await response.json();
        console.log(metaFile, VERSION);
        if (semverGreaterThan(metaFile.version, VERSION)) {
          console.info('Version updated, clearing cache!')
          await clearCacheAndReload();
        }
        console.info('App version up to date!');
      }
    }
    getData();
  }, []);

  return children;
};

export default CacheBuster;
