import React, {
  lazy,
  Suspense,
  useState,
  useEffect,
} from 'react';
import fetchIntercept from 'fetch-intercept';
import { Redirect, Route, Switch } from 'react-router-dom';
import { CircularProgress } from '@material-ui/core';
import { $httpProvider } from 'ngimport';

import AuthenticatedRoute from '@/components/AuthenticatedRoute';
import SecurityContext from '@/components/SecurityContext';
import NavBar from '@/components/NavBar/navbar.component';
import Sidebar from '@/components/Sidebar/sidebar.component';

const LoginView = lazy(() => import('@/views/LoginView'));
const TermsView = lazy(() => import('@/views/TermsView'));
const ReportListingView = lazy(() => import('@/views/ReportListingView'));

/**
 * Entry point to application. Handles routing, app theme, and logged in state.
 */
const Main = () => {
  const [authorizationToken, setAuthorizationToken] = useState('');

  useEffect(() => {
    const interceptor = {
      request: (fetchUrl, fetchConfig) => {
        if (fetchUrl.startsWith(CONFIG.ENDPOINTS.API)) {
          const newConfig = { ...fetchConfig };

          if (!newConfig.headers) {
            newConfig.headers = {};
          }
          newConfig.headers.Authorization = authorizationToken;
          return [fetchUrl, newConfig];
        }
        return [fetchUrl, fetchConfig];
      },
    };

    const angularInterceptor = {
      request: async (config) => {
        if (authorizationToken) {
          config.headers.Authorization = authorizationToken;
        }
        return config;
      },
    };

    $httpProvider.interceptors.push(angularInterceptor);
    const unregister = fetchIntercept.register(interceptor);
    return unregister;
  }, [authorizationToken]);

  return (
    <SecurityContext.Provider value={{ authorizationToken, setAuthorizationToken }}>
      <div>
        <NavBar />
        <Sidebar />
        <section>
          <Suspense fallback={(<CircularProgress color="secondary" />)}>
            <Switch>
              <Route component={LoginView} path="/login" />
              <Route component={TermsView} path="/terms" />
              <AuthenticatedRoute component={ReportListingView} path="/report-listing" />
            </Switch>
          </Suspense>
        </section>
      </div>
    </SecurityContext.Provider>
  );
};

export default Main;
