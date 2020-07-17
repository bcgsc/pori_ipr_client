import React, { useContext, useEffect } from 'react';

import SecurityContext from '@/components/SecurityContext';
import {
  login, isAuthorized, getReferrerUri, keycloak,
} from '@/services/management/auth';

const Login = (props) => {
  const {
    history,
    location,
  } = props;

  const { authorizationToken , setAuthorizationToken } = useContext(SecurityContext);

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
        setAuthorizationToken(keycloak.token);
        history.push(from);
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
