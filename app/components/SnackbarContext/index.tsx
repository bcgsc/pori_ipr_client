import React from 'react';

const SnackbarContext = React.createContext({
  isSnackbarOpen: false,
  setIsSnackbarOpen: () => {},
  snackbarMessage: '',
  setSnackbarMessage: () => {},
});

export default SnackbarContext;
