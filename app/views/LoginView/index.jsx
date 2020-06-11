import React, { useContext, useEffect } from 'react';

import SecurityContext from '@/components/SecurityContext';
import {
  login, isAuthenticated, getReferrerUri, keycloak,
} from '@/services/management/auth';

const Login = (props) => {
  const {
    history,
    location,
  } = props;

  const { authorizationToken, setAuthorizationToken } = useContext(SecurityContext);

  let from;

  try {
    from = location.state.from.pathname;
  } catch (err) {
    from = getReferrerUri() || '/report-listing';
  }

  useEffect(() => {
    if (!isAuthenticated(SecurityContext)) {
      const auth = async () => {
        await login();
        setAuthorizationToken(keycloak.token);
      };

      try {
        auth();
      } catch (err) {
        return undefined;
      }
    } else {
      history.push(from);
    }
  }, [authorizationToken]);

  return (null);
};

export default Login;
