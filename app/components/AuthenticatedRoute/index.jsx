/* eslint-disable react/display-name */
import { PropTypes } from 'prop-types';
import React, { useContext } from 'react';
import {
  Redirect,
  Route,
} from 'react-router-dom';

import SecurityContext from '@/components/SecurityContext';
import { isAuthenticated } from '@/services/management/keycloak.service';
import { isAdmin } from '@/services/management/user.service';

/**
 * @returns {Route} a route component which checks authorization on render or redirects to login
 */
const AuthenticatedRoute = ({
  component: Component, admin, ...rest
}) => {
  const { autheticationToken } = useContext(SecurityContext);

  const authOk = isAuthenticated({ autheticationToken });
  // const adminOk = isAdmin({ autheticationToken });

  let ChildComponent;

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
  } else if (admin) {
    ChildComponent = () => (
      <Redirect to="/" />
    );
  } else {
    ChildComponent = Component;
  }
  return (
    <Route
      {...rest}
      render={props => (<ChildComponent {...props} />)}
    />
  );
};

AuthenticatedRoute.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  component: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  location: PropTypes.object,
  admin: PropTypes.bool,
};

AuthenticatedRoute.defaultProps = {
  location: null,
  admin: false,
};

export default AuthenticatedRoute;
