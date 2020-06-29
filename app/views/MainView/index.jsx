import React, {
  lazy,
  Suspense,
  useState,
  useEffect,
  useCallback,
} from 'react';
import fetchIntercept from 'fetch-intercept';
import { Route, Switch } from 'react-router-dom';
import { CircularProgress } from '@material-ui/core';
import { $httpProvider } from 'ngimport';

import { getUser } from '@/services/management/auth';
import AuthenticatedRoute from '@/components/AuthenticatedRoute';
import SecurityContext from '@/components/SecurityContext';
import NavBar from '@/components/NavBar';
import Sidebar from '@/components/Sidebar';

import './index.scss';

const LoginView = lazy(() => import('@/views/LoginView'));
const TermsView = lazy(() => import('@/views/TermsView'));
const ReportsView = lazy(() => import('@/views/ReportsView'));
const ReportView = lazy(() => import('@/views/ReportView'));
const PrintView = lazy(() => import('@/views/PrintView'));

/**
 * Entry point to application. Handles routing, app theme, and logged in state.
 */
const Main = () => {
  const [authorizationToken, setAuthorizationToken] = useState('');
  const [user, setUser] = useState({ firstName: 'Not', lastName: 'logged in' });
  const [admin, setAdmin] = useState(false);
  const [sidebarMaximized, setSidebarMaximized] = useState(false);
  const [hideNav, setHideNav] = useState(false);

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
        <section className={`${!hideNav ? 'main__content' : ''} ${sidebarMaximized ? 'main__content--maximized' : ''}`}>
          {!hideNav ? (
            <>
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
            </>
          ) : null}
          <Suspense fallback={(<CircularProgress color="secondary" />)}>
            <Switch>
              <Route component={LoginView} path="/login" />
              <Route component={TermsView} path="/terms" />
              <AuthenticatedRoute admin={admin} component={ReportsView} path="/reports" setHideNav={setHideNav} />
              <AuthenticatedRoute component={ReportView} path="/report/:ident" setHideNav={setHideNav} />
              <AuthenticatedRoute component={PrintView} path="/print/:ident" hideNav setHideNav={setHideNav} />
            </Switch>
          </Suspense>
        </section>
      </div>
    </SecurityContext.Provider>
  );
};

export default Main;
