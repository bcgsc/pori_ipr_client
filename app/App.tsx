/**
 * @module /App
 */
import { QueryClientProvider, QueryClient } from 'react-query';
import { SnackbarProvider } from 'notistack';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';

import MainView from './views/MainView';
import { SnackbarUtilsConfigurator } from './services/SnackbarUtils';
import CacheBuster from './components/CacheBuster';
import theme from './appTheme';

// eslint-disable-next-line import/no-extraneous-dependencies
import '@ag-grid-community/core/dist/styles/ag-grid.min.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import '@ag-grid-community/core/dist/styles/ag-theme-material.min.css';
import '@fontsource/roboto';
import './styles/ag-grid.scss';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * 60 * 1000, // 15m
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  CsvExportModule,
]);

/**
 * this is the subfolder (if any) that the application is deployed under
 * @note a properly formatted 'basename' cannot have a trailing slash
 * https://v5.reactrouter.com/web/api/BrowserRouter/basename-string
 */
const basename = window._env_.PUBLIC_PATH.endsWith('/') ? window._env_.PUBLIC_PATH.slice(0, -1) : window._env_.PUBLIC_PATH;

/**
 * Entry point to application. Handles routing, app theme, and logged in state.
 */
function App() {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <SnackbarProvider anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
            <SnackbarUtilsConfigurator />
            <CssBaseline />
            <BrowserRouter basename={basename}>
              <CacheBuster>
                <MainView />
              </CacheBuster>
            </BrowserRouter>
          </SnackbarProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;
