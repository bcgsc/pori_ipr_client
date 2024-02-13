/* eslint-disable react/display-name */
import { PropTypes } from 'prop-types';
import React, { useMemo } from 'react';
import {
  Redirect,
  Route,
} from 'react-router-dom';

import useSecurity from '@/hooks/useSecurity';
import useResource from '@/hooks/useResource';
import { isAuthorized } from '@/services/management/auth';

/**
 * @returns {Route} a route component which checks authorization on render or redirects to login
 */
const AuthenticatedRoute = ({
  component: Component, adminRequired, showNav, onToggleNav, ...rest
}) => {
  const { authorizationToken } = useSecurity();
  const { adminAccess } = useResource();
  const authOk = isAuthorized(authorizationToken);

  const ChildComponent = useMemo(() => {
    if (!authOk) {
      return (props) => {
        const { location } = props;
        return (
          <Redirect to={{
            pathname: '/login',
            state: { from: location },
          }}
          />
        );
      };
    }

    if (!adminAccess && adminRequired) {
      return () => (
        <Redirect to="/" />
      );
    }
    return Component;
  }, [Component, adminAccess, adminRequired, authOk]);

  if (showNav) {
    onToggleNav(true);
  } else {
    onToggleNav(false);
  }

  return (
    <Route
      {...rest}
      render={(props) => (<ChildComponent {...props} />)}
    />
  );
};

AuthenticatedRoute.propTypes = {
  adminRequired: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  component: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  location: PropTypes.object,
  onToggleNav: PropTypes.func,
  showNav: PropTypes.bool,
};

AuthenticatedRoute.defaultProps = {
  adminRequired: false,
  location: null,
  onToggleNav: () => {},
  showNav: false,
};

export default AuthenticatedRoute;
