/* eslint-disable react/display-name */
import { PropTypes } from 'prop-types';
import React, { useContext } from 'react';
import {
  Redirect,
  Route,
} from 'react-router-dom';

import SecurityContext from '@/components/SecurityContext';
import { isAuthorized } from '@/services/management/auth';

/**
 * @returns {Route} a route component which checks authorization on render or redirects to login
 */
const AuthenticatedRoute = ({
  component: Component, adminRequired, admin, hideNav, setHideNav, ...rest
}) => {
  const { authorizationToken } = useContext(SecurityContext);
  const authOk = isAuthorized(authorizationToken);

  let ChildComponent = null;

  if (!authOk) {
    ChildComponent = (props) => {
      const { location } = props;
      return (
        <Redirect to={{
          pathname: '/login',
          state: { from: location },
        }}
        />
      );
    };
  } else if (!admin && adminRequired) {
    ChildComponent = () => (
      <Redirect to="/" />
    );
  } else {
    ChildComponent = Component;
  }
  if (hideNav) {
    setHideNav(true);
  } else {
    setHideNav(false);
  }

  return (
    <>
      <Route
        {...rest}
        render={props => (<ChildComponent admin={admin} {...props} />)}
      />
    </>
  );
};

AuthenticatedRoute.propTypes = {
  component: PropTypes.node.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  location: PropTypes.object,
  admin: PropTypes.bool,
};

AuthenticatedRoute.defaultProps = {
  location: null,
  admin: false,
};

export default AuthenticatedRoute;
