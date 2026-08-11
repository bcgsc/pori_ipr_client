// Thin wrapper around window.location.reload so callers have an injectable
// seam — jsdom locks down window.location, making the global impossible to spy
// on directly in tests.
const reloadWindow = (): void => {
  window.location.reload();
};

export default reloadWindow;
