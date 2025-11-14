onmessage = (e) => {
  const { targetEpochTime } = e.data;

  const interval = setInterval(() => {
    const now = Date.now();
    const remaining = Math.floor((targetEpochTime - now) / 1000);

    if (remaining <= 0) {
      clearInterval(interval);
      postMessage({ expired: true, remaining: 0 });
    } else {
      postMessage({ expired: false, remaining });
    }
  }, 1000);
};
