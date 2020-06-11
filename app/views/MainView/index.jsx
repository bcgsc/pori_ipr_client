import React, {
  lazy,
  Suspense,
  useState,
  useEffect,
} from 'react';
import fetchIntercept from 'fetch-intercept';
import { Route, Switch } from 'react-router-dom';
import { CircularProgress } from '@material-ui/core';
import { $httpProvider } from 'ngimport';

import { getUser } from '@/services/management/auth';
import AuthenticatedRoute from '@/components/AuthenticatedRoute';
import SecurityContext from '@/components/SecurityContext';
import NavBar from '@/components/NavBar/navbar.component';
import Sidebar from '@/components/Sidebar/sidebar.component';

import './index.scss';

const LoginView = lazy(() => import('@/views/LoginView'));
const TermsView = lazy(() => import('@/views/TermsView'));
const ReportListingView = lazy(() => import('@/views/ReportListingView'));

/**
 * Entry point to application. Handles routing, app theme, and logged in state.
 */
const Main = () => {
  const [authorizationToken, setAuthorizationToken] = useState('');
  const [user, setUser] = useState({ firstName: 'Not', lastName: 'logged in' });
  const [admin, setAdmin] = useState(false);
  const [sidebarMaximized, setSidebarMaximized] = useState(false);

  useEffect(() => {
    if (authorizationToken) {
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

      $httpProvider.defaults.headers.common.Authorization = authorizationToken;

      const unregister = fetchIntercept.register(interceptor);

      const asyncUser = async () => {
        const { user: userResp, admin: adminResp } = await getUser();
        setUser(userResp);
        setAdmin(adminResp);
      };

      asyncUser();

      return unregister;
    }
  }, [authorizationToken]);

  return (
    <SecurityContext.Provider value={{ authorizationToken, setAuthorizationToken }}>
      <div>
        <NavBar
          sidebarMaximized={sidebarMaximized}
          setSidebarMaximized={setSidebarMaximized}
          user={user}
        />
        <Sidebar
          sidebarMaximized={sidebarMaximized}
          setSidebarMaximized={setSidebarMaximized}
          user={user}
          admin={admin}
        />
        <section className={`main__content ${sidebarMaximized ? 'main__content--maximized' : ''}`}>
          <Suspense fallback={(<CircularProgress color="secondary" />)}>
            <Switch>
              <Route component={LoginView} path="/login" />
              <Route component={TermsView} path="/terms" />
              <AuthenticatedRoute admin={admin} component={ReportListingView} path="/report-listing" />
            </Switch>
          </Suspense>
        </section>
      </div>
    </SecurityContext.Provider>
  );
};

export default Main;
