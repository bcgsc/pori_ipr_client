import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../app/appTheme';

import '../app/index.scss';
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-material.css';
import '../app/styles/ag-grid.scss';
import './preview.css';

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
