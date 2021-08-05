import { useContext, useEffect } from 'react';
import fetchIntercept from 'fetch-intercept';

import SecurityContext from '@/context/SecurityContext';
import {
  login, isAuthorized, getReferrerUri, keycloak, getUser,
} from '@/services/management/auth';

const Login = (props) => {
  const {
    history,
    location,
  } = props;

  const {
    authorizationToken,
    setAuthorizationToken,
    setUserDetails,
  } = useContext(SecurityContext);

  let from;

  try {
    from = location.state.from.pathname + location.state.from.search;
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
        return undefined;
      }
    } else {
      const retrieveUser = async () => {
        const user = await getUser(authorizationToken);
        setUserDetails(user);
        history.push(from);
      };

      retrieveUser();
    }
  }, [authorizationToken, from, history, setAuthorizationToken, setUserDetails]);

  return (null);
};

export default Login;
