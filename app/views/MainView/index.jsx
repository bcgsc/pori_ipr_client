import React, {
  lazy,
  Suspense,
  useState,
  useEffect,
} from 'react';
import fetchIntercept from 'fetch-intercept';
import { Route, Switch, Redirect } from 'react-router-dom';
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
const GermlineView = lazy(() => import('@/views/GermlineView'));
const AdminView = lazy(() => import('@/views/AdminView'));

/**
 * Entry point to application. Handles routing, app theme, and logged in state.
 */
const Main = () => {
  const [authorizationToken, setAuthorizationToken] = useState('');
  const [admin, setAdmin] = useState(false);
  const [user, setUser] = useState({ firstName: 'Not', lastName: 'logged in' });
  const [sidebarMaximized, setSidebarMaximized] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);

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
        const userResp = await getUser();
        setUser(userResp);
        setAdmin(userResp.groups.some(group => group.name.toLowerCase() === 'admin'));
      };

      asyncUser();

      return unregister;
    }
  }, [authorizationToken]);

  return (
    <SecurityContext.Provider value={{ authorizationToken, setAuthorizationToken }}>
      <div>
        <section className={`${isNavVisible ? 'main__content' : ''} ${sidebarMaximized ? 'main__content--maximized' : ''}`}>
          {isNavVisible ? (
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
              <Route path="/" exact>
                <Redirect to={{ pathname: '/reports' }} />
              </Route>
              <AuthenticatedRoute admin={admin} component={ReportsView} path="/reports" onToggleNav={setIsNavVisible} />
              <AuthenticatedRoute component={ReportView} path="/report/:ident" onToggleNav={setIsNavVisible} />
              <AuthenticatedRoute component={PrintView} path="/print/:ident" isNavVisible={false} onToggleNav={setIsNavVisible} />
              <AuthenticatedRoute component={GermlineView} path="/germline" onToggleNav={setIsNavVisible} />
              <AuthenticatedRoute admin={admin} adminRequired component={AdminView} path="/admin" onToggleNav={setIsNavVisible} />
            </Switch>
          </Suspense>
        </section>
      </div>
    </SecurityContext.Provider>
  );
};

export default Main;
