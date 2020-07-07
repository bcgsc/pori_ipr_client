/* eslint-disable react/display-name */
import { PropTypes } from 'prop-types';
import React, { useEffect, useState, useContext } from 'react';
import {
  Redirect,
  Route,
} from 'react-router-dom';

import SecurityContext from '@/components/SecurityContext';
import { isAuthorized, isAdmin } from '@/services/management/auth';

/**
 * @returns {Route} a route component which checks authorization on render or redirects to login
 */
const AuthenticatedRoute = ({
  component: Component, admin, adminRequired, isNavVisible, onToggleNav, ...rest
}) => {
  const { authorizationToken } = useContext(SecurityContext);
  const [ChildComponent, setChildComponent] = useState(null);

  const [adminOk, setAdminOk] = useState(false);
  const authOk = isAuthorized(authorizationToken);

  useEffect(() => {
    const getData = async () => {
      const adminResp = await isAdmin();
      setAdminOk(adminResp);

      if (!authOk) {
        setChildComponent(() => (props) => {
          const { location } = props;
          return (
            <Redirect to={{
              pathname: '/login',
              state: { from: location },
            }}
            />
          );
        });
      } else if (!adminResp && adminRequired) {
        setChildComponent(() => () => (
          <Redirect to="/" />
        ));
      } else {
        setChildComponent(Component);
      }
      if (isNavVisible) {
        onToggleNav(true);
      } else {
        onToggleNav(false);
      }
    };
    getData();
  }, []);

  return (
    <>
      {ChildComponent && (
        <Route
          {...rest}
          render={props => (<ChildComponent admin={adminOk} {...props} />)}
        />
      )}
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
