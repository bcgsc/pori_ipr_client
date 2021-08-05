import React, {
  lazy,
  Suspense,
  useState,
  useCallback,
} from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { CircularProgress, Snackbar } from '@material-ui/core';

import AuthenticatedRoute from '@/components/AuthenticatedRoute';
import SidebarContext from '@/context/SidebarContext';
import SecurityContext from '@/context/SecurityContext';
import { EditContextProvider } from '@/context/EditContext';
import { ResourceContextProvider } from '@/context/ResourceContext';
import SnackbarContext from '@/context/SnackbarContext';
import NavBar from '@/components/NavBar';
import Sidebar from '@/components/Sidebar';

import './index.scss';

const LoginView = lazy(() => import('../LoginView'));
const TermsView = lazy(() => import('../TermsView'));
const ReportsView = lazy(() => import('../ReportsView'));
const ReportView = lazy(() => import('../ReportView'));
const PrintView = lazy(() => import('../PrintView'));
const GermlineView = lazy(() => import('../GermlineView'));
const AdminView = lazy(() => import('../AdminView'));
const LinkOutView = lazy(() => import('../LinkOutView'));
const PatientsView = lazy(() => import('../PatientsView'));
const TemplateView = lazy(() => import('../TemplateView'));

/**
 * Entry point to application. Handles routing, app theme, and logged in state.
 */
const Main = (): JSX.Element => {
  const [authorizationToken, setAuthorizationToken] = useState('');
  const [userDetails, setUserDetails] = useState('');
  const [sidebarMaximized, setSidebarMaximized] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSnackbarClose = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsSnackbarOpen(false);
  }, []);

  return (
    <SecurityContext.Provider
      value={{
        authorizationToken, setAuthorizationToken, userDetails, setUserDetails,
      }}
    >
      <EditContextProvider>
        <ResourceContextProvider>
          <SnackbarContext.Provider
            value={{
              isSnackbarOpen, setIsSnackbarOpen, snackbarMessage, setSnackbarMessage,
            }}
          >
            <SidebarContext.Provider
              value={{
                sidebarMaximized, setSidebarMaximized,
              }}
            >
              <div>
                <section className={`${isNavVisible ? 'main__content' : ''} ${sidebarMaximized ? 'main__content--maximized' : ''}`}>
                  {isNavVisible ? (
                    <>
                      <NavBar />
                      <Sidebar />
                    </>
                  ) : null}
                  <Suspense fallback={(<CircularProgress color="secondary" />)}>
                    <Switch>
                      <Route component={LoginView} path="/login" />
                      <Route component={LinkOutView} path="/graphkb" />
                      <Route path="/" exact>
                        <Redirect to={{ pathname: '/reports' }} />
                      </Route>
                      <AuthenticatedRoute component={TermsView} path="/terms" />
                      <AuthenticatedRoute component={ReportsView} path="/reports" />
                      <AuthenticatedRoute exact component={PatientsView} path="/reports/patients/:patientId" />
                      <Redirect exact from="/report/:ident/(genomic|probe)/summary" to="/report/:ident/summary" />
                      <AuthenticatedRoute component={ReportView} path="/report/:ident" />
                      <AuthenticatedRoute component={PrintView} path="/print/:ident" showNav={false} onToggleNav={setIsNavVisible} />
                      <AuthenticatedRoute component={GermlineView} path="/germline" />
                      <AuthenticatedRoute adminRequired component={AdminView} path="/admin" />
                      <AuthenticatedRoute adminRequired component={TemplateView} path="/template" />
                    </Switch>
                  </Suspense>
                  <Snackbar
                    open={isSnackbarOpen}
                    message={snackbarMessage}
                    autoHideDuration={3500}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                  />
                </section>
              </div>
            </SidebarContext.Provider>
          </SnackbarContext.Provider>
        </ResourceContextProvider>
      </EditContextProvider>
    </SecurityContext.Provider>
  );
};

export default Main;
