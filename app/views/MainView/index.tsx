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

import AuthenticatedRoute from '../../components/AuthenticatedRoute';
import SecurityContext from '../../components/SecurityContext';
import EditContext from '../../components/EditContext';
import NavBar from '../../components/NavBar';
import Sidebar from '../../components/Sidebar';
import AclService from '../../services/management/acl.service';

import './index.scss';

const LoginView = lazy(() => import('../LoginView'));
const TermsView = lazy(() => import('../TermsView'));
const ReportsView = lazy(() => import('../ReportsView'));
const ReportView = lazy(() => import('../ReportView'));
const PrintView = lazy(() => import('../PrintView'));
const GermlineView = lazy(() => import('../GermlineView'));
const AdminView = lazy(() => import('../AdminView'));
const LinkOutView = lazy(() => import('../LinkOutView'));

/**
 * Entry point to application. Handles routing, app theme, and logged in state.
 */
const Main = () => {
  const [authorizationToken, setAuthorizationToken] = useState('');
  const [canEdit, setCanEdit] = useState(false);
  const [userDetails, setUserDetails] = useState('');
  const [adminUser, setAdminUser] = useState(false);
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

      const getData = async () => {
        setCanEdit(await AclService.checkAction('report.edit'));
      };

      getData();

      return unregister;
    }
  }, [authorizationToken]);

  return (
    <SecurityContext.Provider
      value={{
        authorizationToken, setAuthorizationToken, userDetails, setUserDetails, adminUser, setAdminUser,
      }}
    >
      <EditContext.Provider
        value={{
          canEdit, setCanEdit,
        }}
      >
        <div>
          <section className={`${isNavVisible ? 'main__content' : ''} ${sidebarMaximized ? 'main__content--maximized' : ''}`}>
            {isNavVisible ? (
              <>
                <NavBar
                  sidebarMaximized={sidebarMaximized}
                  setSidebarMaximized={setSidebarMaximized}
                  user={userDetails}
                />
                <Sidebar
                  sidebarMaximized={sidebarMaximized}
                  setSidebarMaximized={setSidebarMaximized}
                  user={userDetails}
                  admin={adminUser}
                />
              </>
            ) : null}
            <Suspense fallback={(<CircularProgress color="secondary" />)}>
              <Switch>
                <Route component={LoginView} path="/login" />
                <Route component={LinkOutView} path="/graphkb" />
                <Route path="/" exact>
                  <Redirect to={{ pathname: '/reports' }} />
                </Route>
                <AuthenticatedRoute component={TermsView} path="/terms" isNavVisible={isNavVisible} onToggleNav={setIsNavVisible} />
                <AuthenticatedRoute admin={adminUser} component={ReportsView} path="/reports" isNavVisible={isNavVisible} onToggleNav={setIsNavVisible} />
                <Redirect exact from="/report/:ident/(genomic|probe)/summary" to="/report/:ident/summary" />
                <AuthenticatedRoute component={ReportView} path="/report/:ident" isNavVisible={isNavVisible} onToggleNav={setIsNavVisible} />
                <AuthenticatedRoute component={PrintView} path="/print/:ident" isNavVisible={false} onToggleNav={setIsNavVisible} />
                <AuthenticatedRoute component={GermlineView} path="/germline" isNavVisible={isNavVisible} onToggleNav={setIsNavVisible} />
                <AuthenticatedRoute admin={adminUser} adminRequired component={AdminView} path="/admin" isNavVisible={isNavVisible} onToggleNav={setIsNavVisible} />
              </Switch>
            </Suspense>
          </section>
        </div>
      </EditContext.Provider>
    </SecurityContext.Provider>
  );
};

export default Main;
