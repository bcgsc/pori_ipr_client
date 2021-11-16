/**
 * @module /App
 */
import { SnackbarProvider } from 'notistack';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import MainView from './views/MainView';
import { SnackbarUtilsConfigurator } from './services/SnackbarUtils';
import CacheBuster from './components/CacheBuster';
import cssTheme from './styles/_theme.module.scss';

// eslint-disable-next-line import/no-extraneous-dependencies
import '@ag-grid-community/core/dist/styles/ag-grid.min.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import '@ag-grid-community/core/dist/styles/ag-theme-material.min.css';
import '@fontsource/roboto';
import './styles/ag-grid.scss';

console.log(cssTheme);
const theme = createTheme({
  direction: 'ltr',
  palette: {
    primary: {
      main: cssTheme.primaryMain,
      light: cssTheme.primaryLight,
      dark: cssTheme.primaryDark,
      contrastText: cssTheme.primaryContrastText,
    },
    secondary: {
      main: cssTheme.secondaryMain,
      light: cssTheme.secondaryLight,
      dark: cssTheme.secondaryDark,
      contrastText: cssTheme.secondaryContrastText,
    },
    error: {
      main: cssTheme.errorMain,
      light: cssTheme.errorLight,
      dark: cssTheme.errorDark,
      contrastText: cssTheme.errorContrastText,
    },
    text: {
      primary: cssTheme.textPrimary,
      secondary: cssTheme.textSecondary,
      disabled: cssTheme.textDisabled,
    },
  },
  typography: {
    body1: { fontSize: cssTheme.fontSizeBody1 },
    body2: { fontSize: cssTheme.fontSizeBody2 },
    h1: { fontSize: cssTheme.fontSizeH1 },
    h2: { fontSize: cssTheme.fontSizeH2 },
    h3: { fontSize: cssTheme.fontSizeH3 },
    h4: { fontSize: cssTheme.fontSizeH4 },
    h5: { fontSize: cssTheme.fontSizeH5 },
    h6: { fontSize: cssTheme.fontSizeH6 },
    subtitle1: { fontSize: cssTheme.fontSizeSubtitle1 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@global': {
          html: {
            WebkitFontSmoothing: 'auto',
          },
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: cssTheme.fontSizeH2,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        color: 'inherit',
      },
    },
    MuiTabs: {
      defaultProps: {
        indicatorColor: 'secondary',
        textColor: 'secondary',
      },
    },
  },
});

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  CsvExportModule,
]);

/**
 * Entry point to application. Handles routing, app theme, and logged in state.
 */
function App() {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <SnackbarProvider anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
          <SnackbarUtilsConfigurator />
          <CssBaseline />
          <BrowserRouter basename={window._env_.PUBLIC_PATH}>
            <CacheBuster>
              <MainView />
            </CacheBuster>
          </BrowserRouter>
        </SnackbarProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;

export {
  theme,
};
