/* eslint-disable react/display-name */
import React, { LazyExoticComponent, useMemo, ComponentType } from 'react';
import {
  Redirect,
  Route,
  RouteProps,

} from 'react-router-dom';

import useSecurity from '@/hooks/useSecurity';
import useResource from '@/hooks/useResource';
import { isAuthorized } from '@/services/management/auth';

type AuthenticatedRouteType = {
  component: ComponentType<never> | LazyExoticComponent<ComponentType<never>>,
  requiredAccess?: string,
  showNav?: boolean,
  onToggleNav?: React.Dispatch<React.SetStateAction<boolean>>,
} & RouteProps;

/**
 * @returns {Route} a route component which checks authorization on render or redirects to login
 */
const AuthenticatedRoute = ({
  component: Component,
  requiredAccess,
  showNav,
  onToggleNav,
  ...rest
}: AuthenticatedRouteType) => {
  const { authorizationToken } = useSecurity();
  const resourceAccess = useResource();
  const authOk = isAuthorized(authorizationToken);

  const ChildComponent = useMemo(() => {
    if (!authOk) {
      return (props: RouteProps) => {
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

    if (requiredAccess && !resourceAccess[requiredAccess]) {
      return () => (
        <Redirect to="/" />
      );
    }

    return Component;
  }, [authOk, resourceAccess, requiredAccess, Component]);

  if (onToggleNav) {
    if (showNav) {
      onToggleNav(true);
    } else {
      onToggleNav(false);
    }
  }

  return (
    <Route
      {...rest}
      render={(props) => (<ChildComponent {...props} />)}
    />
  );
};

export default AuthenticatedRoute;
