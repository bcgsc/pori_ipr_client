import React, {
  lazy,
  Suspense,
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
  memo,
} from 'react';
import {
  Route, Switch, Redirect, useHistory,
} from 'react-router-dom';
import {
  CircularProgress, Button, Dialog, DialogContent, DialogTitle, DialogActions,
} from '@mui/material';

import AuthenticatedRoute from '@/components/AuthenticatedRoute';
import SidebarContext from '@/context/SidebarContext';
import { SecurityContext, SecurityContextType } from '@/context/SecurityContext';
import { ResourceContextProvider } from '@/context/ResourceContext';
import NavBar from '@/components/NavBar';
import Sidebar from '@/components/Sidebar';
import snackbar from '@/services/SnackbarUtils';
import { keycloak, logout } from '@/services/management/auth';
import './index.scss';
import { Box } from '@mui/system';
import { toInteger } from 'lodash';

const LoginView = lazy(() => import('../LoginView'));
const TermsView = lazy(() => import('../TermsView'));
const ReportsView = lazy(() => import('../ReportsView'));
const MyReportsView = lazy(() => import('../MyReportsView'));
const PatientsView = lazy(() => import('../PatientsView'));
const SearchView = lazy(() => import('../SearchView'));
const ReportsSearchView = lazy(() => import('../ReportsSearchView'));
const ReportView = lazy(() => import('../ReportView'));
const PrintView = lazy(() => import('../PrintView'));
const CondensedPrintView = (props) => <PrintView {...props} printVersion="condensedLayout" />;
const GermlineView = lazy(() => import('../GermlineView'));
const AdminView = lazy(() => import('../AdminView'));
const LinkOutView = lazy(() => import('../LinkOutView'));
const TemplateView = lazy(() => import('../TemplateView'));
const ProjectsView = lazy(() => import('../ProjectsView'));
const VariantTextView = lazy(() => import('../VariantTextView'));

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

const CountDown = memo(({ startingTime }: {
  startingTime: number;
}) => {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    setSeconds(startingTime);
  }, [startingTime]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSeconds((s) => {
        if (s > 0) {
          return s - 1;
        }
        clearInterval(intervalId);
        return 0;
      });
    }, 1000); // countdown interval of 1 second

    return () => clearInterval(intervalId); // cleanup on unmount
  }, [startingTime]);

  return <span>{formatTime(seconds)}</span>;
});

// What fraction of TIME ELAPSED should the user be notified of expiring token
const TIMEOUT_FRACTION = 0.9;

type TimeoutModalPropTypes = {
  authorizationToken: string;
  setAuthorizationToken: React.Dispatch<React.SetStateAction<string>>;
};

const TimeoutModal = memo(({ authorizationToken, setAuthorizationToken }: TimeoutModalPropTypes) => {
  const { location: { key: locationKey } } = useHistory();
  const [open, setIsOpen] = useState(false);
  // Seconds in which to show in the countdown component
  const [countDown, setCountDown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef(null);

  // Refresh token everytime user navigates the page, much cleaner than if they did ANY action
  useEffect(() => {
    const refresh = async () => {
      if (keycloak.authenticated) {
        await keycloak.updateToken(Number.MAX_SAFE_INTEGER);
        setAuthorizationToken(() => keycloak.token);
      }
    };
    refresh();
  }, [locationKey, setAuthorizationToken]);

  // First load is untracked, until authorizationToken changes
  useEffect(() => {
    if (authorizationToken) {
      // Ms in which token will expire
      const minTimeToExpire = Math.min(keycloak.tokenParsed.exp, keycloak.refreshTokenParsed.exp) * 1000;

      const timeToShowModal = (minTimeToExpire - Date.now()) * TIMEOUT_FRACTION;

      timerRef.current = setTimeout(() => {
        setIsOpen(true);
        setCountDown(toInteger((minTimeToExpire - Date.now()) / 1000));
      }, timeToShowModal);
    }
    return () => {
      if (timerRef.current) { clearTimeout(timerRef.current); }
    };
  }, [authorizationToken]);

  const handleClose = useCallback((_evt, reason) => {
    if (reason !== 'backdropClick') { setIsOpen(false); }
  }, []);

  const handleConfirm = useCallback(async () => {
    const timeoutTime = ((keycloak.tokenParsed.exp * 1000) - Date.now());
    try {
      setIsLoading(true);
      await keycloak?.updateToken(timeoutTime > 0 ? timeoutTime : 0);
      setAuthorizationToken(keycloak.token);
      setIsOpen(false);
    } catch (e) {
      snackbar.error(`Unable to refresh: ${e?.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [setAuthorizationToken]);

  return (
    <Dialog open={open} onClose={handleClose} onBackdropClick={null}>
      <DialogTitle>Session Timeout Notification</DialogTitle>
      <DialogContent>
        <p>
          {'Your session is about to expire in '}
          <CountDown startingTime={countDown} />
          , would you like to remain logged in?
        </p>
      </DialogContent>
      <DialogActions>
        <Button disabled={isLoading} onClick={logout}>Logout</Button>
        <Button
          disabled={isLoading}
          onClick={handleConfirm}
          color="primary"
          variant="contained"
        >
          {isLoading ? <CircularProgress color="inherit" size={24} /> : 'Stay logged in'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

/**
 * Entry point to application. Handles routing, app theme, and logged in state.
 */
const Main = (): JSX.Element => {
  const [authorizationToken, setAuthorizationToken] = useState('');
  const [userDetails, setUserDetails] = useState<SecurityContextType['userDetails']>({
    firstName: null,
    lastName: null,
    username: null,
    groups: [],
    email: null,
    deletedAt: null,
    lastLogin: null,
    projects: [],
    type: null,
  });
  const [sidebarMaximized, setSidebarMaximized] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);

  const secContextVal = useMemo<SecurityContextType>(() => ({
    authorizationToken, setAuthorizationToken, userDetails, setUserDetails,
  }), [authorizationToken, setAuthorizationToken, userDetails, setUserDetails]);

  const sideBarContextVal = useMemo(() => ({
    sidebarMaximized, setSidebarMaximized,
  }), [sidebarMaximized, setSidebarMaximized]);

  return (
    <SecurityContext.Provider value={secContextVal}>
      <ResourceContextProvider>
        <SidebarContext.Provider value={sideBarContextVal}>
          <div>
            <section className={`${isNavVisible ? 'main__content' : ''} ${sidebarMaximized ? 'main__content--maximized' : ''}`}>
              {isNavVisible ? (
                <>
                  <NavBar />
                  <Sidebar />
                </>
              ) : null}
              <Suspense fallback={(
                <Box
                  sx={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <CircularProgress color="secondary" />
                </Box>
              )}
              >
                <TimeoutModal authorizationToken={authorizationToken} setAuthorizationToken={setAuthorizationToken} />
                <Switch>
                  <Route component={LoginView} path="/login" />
                  <Route component={LinkOutView} path="/graphkb" />
                  <Route path="/" exact>
                    <Redirect to={{ pathname: '/reports' }} />
                  </Route>
                  <AuthenticatedRoute component={TermsView} path="/terms" />
                  <AuthenticatedRoute exact component={PatientsView} path="/reports/patients/:patientId" />
                  <AuthenticatedRoute exact component={ReportsSearchView} path="/search/result" />
                  <AuthenticatedRoute component={ReportsView} path="/reports" />
                  <AuthenticatedRoute component={MyReportsView} path="/my-reports" />
                  <AuthenticatedRoute component={SearchView} path="/search" />
                  <Redirect exact from="/report/:ident/(genomic|probe)/summary" to="/report/:ident/summary" />
                  <AuthenticatedRoute component={ReportView} path="/report/:ident" />
                  <AuthenticatedRoute component={PrintView} path="/print/:ident" showNav={false} onToggleNav={setIsNavVisible} />
                  <AuthenticatedRoute component={CondensedPrintView} path="/condensedLayoutPrint/:ident" showNav={false} onToggleNav={setIsNavVisible} />
                  <AuthenticatedRoute requiredAccess="germlineAccess" component={GermlineView} path="/germline" />
                  <AuthenticatedRoute component={ProjectsView} path="/projects" />
                  <AuthenticatedRoute requiredAccess="variantTextEditAccess" component={VariantTextView} path="/variant-text" />
                  <AuthenticatedRoute requiredAccess="appendixEditAccess" component={AdminView} path="/admin/appendices" />
                  <AuthenticatedRoute requiredAccess="managerAccess" component={AdminView} path="/admin" />
                  <AuthenticatedRoute requiredAccess="templateEditAccess" component={TemplateView} path="/template" />
                </Switch>
              </Suspense>
            </section>
          </div>
        </SidebarContext.Provider>
      </ResourceContextProvider>
    </SecurityContext.Provider>
  );
};

export default Main;
