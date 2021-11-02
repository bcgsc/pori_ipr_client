/**
 * @module /App
 */
import { SnackbarProvider } from 'notistack';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider, Theme, StyledEngineProvider, adaptV4Theme } from '@mui/material/styles';
import createGenerateClassName from '@mui/styles/createGenerateClassName';
import jssPreset from '@mui/styles/jssPreset';
import { create } from 'jss';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import MainView from './views/MainView';
import { SnackbarUtilsConfigurator } from './services/SnackbarUtils';
import CacheBuster from './components/CacheBuster';
import cssTheme from './styles/_theme.scss';

import '@ag-grid-community/core/dist/styles/ag-grid.min.css';
import '@ag-grid-community/core/dist/styles/ag-theme-material.min.css';
import '@fontsource/roboto';
import './styles/ag-grid.scss';


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}


const theme = createTheme(adaptV4Theme({
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
      hint: cssTheme.textHint,
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
  // Dialog title header bug: https://github.com/mui-org/material-ui/issues/16569
  props: {
    MuiDialogTitle: {
      disableTypography: true,
    },
  },
  overrides: {
    MuiDialogTitle: {
      root: {
        fontSize: cssTheme.fontSizeH3,
      },
    },
    MuiCssBaseline: {
      '@global': {
        html: {
          WebkitFontSmoothing: 'auto',
        },
      },
    },
  },
}));

const generateClassName = createGenerateClassName({
  productionPrefix: 'ipr',
});

const jss = create({
  ...jssPreset(),
  // We define a custom insertion point that JSS will look for injecting the styles in the DOM.
  insertionPoint: 'jss-insertion-point',
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
