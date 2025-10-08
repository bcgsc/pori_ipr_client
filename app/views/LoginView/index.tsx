import React, { useEffect, useState } from 'react';
import fetchIntercept from 'fetch-intercept';
import { RouteChildrenProps } from 'react-router-dom';

import useSecurity from '@/hooks/useSecurity';
import {
  login, isAuthorized, getReferrerUri, keycloak,
} from '@/services/management/auth';
import api from '@/services/api';
import { Typography } from '@mui/material';
import './index.scss';

export const trimKeyCloakStates = (hash?: string): string => {
  if (!hash) return '';

  const [clean] = hash.split('&'); // keeps everything before the first "&"
  return clean;
};

const Login = (props: RouteChildrenProps): JSX.Element => {
  const {
    history,
    location,
  } = props;

  const {
    authorizationToken,
    setAuthorizationToken,
    setUserDetails,
  } = useSecurity();

  const [error, setError] = useState<string | null>(null);

  let from;

  try {
    from = location.state.from.pathname + location.state.from.search + trimKeyCloakStates(location.state.from.hash);
  } catch (err) {
    from = getReferrerUri() || '/reports';
  }

  useEffect(() => {
    if (!isAuthorized(authorizationToken)) {
      const auth = async () => {
        await login(from);
        const interceptor = {
          request: (fetchUrl, fetchConfig) => {
            if (fetchUrl.startsWith(window._env_.API_BASE_URL)) {
              const newConfig = { ...fetchConfig };

              if (!newConfig.headers) {
                newConfig.headers = {};
              }
              newConfig.headers.Authorization = keycloak.token;
              return [fetchUrl, newConfig];
            }
            return [fetchUrl, fetchConfig];
          },
        };

        const unregister = fetchIntercept.register(interceptor);
        setAuthorizationToken(keycloak.token);
        return unregister;
      };

      try {
        auth();
      } catch (err) {
        const message = `Error getting token: ${err.toString}`;
        setError(message);
        return undefined;
      }
    } else {
      const retrieveUser = async () => {
        try {
          const user = await api.get('/user/me').request();
          setUserDetails(user);
          history.push(from);
        } catch (err) {
          const message = `Error retrieving user ${err?.content?.url}: ${err?.content?.status} ${err.toString()}`;
          setError(message);
        }
      };

      retrieveUser();
    }
    return undefined;
  }, [authorizationToken, from, history, setAuthorizationToken, setUserDetails]);

  return (
    <div>
      {error ? (
        <div className="auth-centered">
          <Typography color="error" gutterBottom variant="h2">Error Authenticating</Typography>
          <Typography paragraph>An Error occurred while authenticating. please logout and try again or contact your administrator if the problem persists</Typography>
          <Typography paragraph>{error}</Typography>
        </div>
      ) : null}
    </div>
  );
};

export default Login;
