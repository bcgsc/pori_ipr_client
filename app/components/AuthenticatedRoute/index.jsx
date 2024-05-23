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
  component: Component, managerRequired, templateEditorRequired, appendixEditorRequired, germlineRequired, showNav, onToggleNav, ...rest
}) => {
  const { authorizationToken } = useSecurity();
  const { managerAccess, adminAccess, templateEditAccess, appendixEditAccess, germlineAccess } = useResource();
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

    if (!managerAccess && managerRequired) {
      return () => (
        <Redirect to="/" />
      );
    }
    if (!templateEditAccess && templateEditorRequired) {
      return () => (
        <Redirect to="/" />
      );
    }
    if (!appendixEditAccess && appendixEditorRequired) {
      return () => (
        <Redirect to="/" />
      );
    }
    if (!germlineAccess && germlineRequired) {
      return () => (
        <Redirect to="/" />
      );
    }
    return Component;
  }, [Component, adminAccess, managerAccess, templateEditAccess, germlineAccess, appendixEditAccess, managerRequired, templateEditorRequired, germlineRequired, appendixEditorRequired, authOk]);

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
  managerRequired: PropTypes.bool,
  templateEditorRequired: PropTypes.bool,
  appendixEditorRequired: PropTypes.bool,
  germlineRequired: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  component: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  location: PropTypes.object,
  onToggleNav: PropTypes.func,
  showNav: PropTypes.bool,
};

AuthenticatedRoute.defaultProps = {
  managerRequired: false,
  templateEditorRequired: false,
  appendixEditorRequired: false,
  germlineRequired: false,
  location: null,
  onToggleNav: () => { },
  showNav: false,
};

export default AuthenticatedRoute;
