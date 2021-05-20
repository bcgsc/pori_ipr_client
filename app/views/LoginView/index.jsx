import React, { useContext, useEffect } from 'react';

import SecurityContext from '@/context/SecurityContext';
import {
  login, isAuthorized, getReferrerUri, keycloak, getUser, isAdmin,
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
    setAdminUser,
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
        setAuthorizationToken(keycloak.token);
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
        const admin = isAdmin(user);
        setAdminUser(admin);
        history.push(from);
      };

      retrieveUser();
    }
  }, [authorizationToken, from, history, setAdminUser, setAuthorizationToken, setUserDetails]);

  return (null);
};

export default Login;
