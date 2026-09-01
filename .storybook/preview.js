import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../app/appTheme';

// Loaded globally so any story rendering an ag-grid is styled the same way the
// app styles it (see app/App.tsx), without each story importing these itself.
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-material.css';
import '../app/styles/ag-grid.scss';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

const withThemeProvider = (Story, context) => {
  return <ThemeProvider theme={theme}><Story {...context}/></ThemeProvider>;
};

export const decorators = [withThemeProvider];
