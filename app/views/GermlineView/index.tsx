import React, { lazy, useEffect } from 'react';
import {
  Switch, Route, useHistory,
} from 'react-router-dom';

import snackbar from '@/services/SnackbarUtils';
import useResource from '@/hooks/useResource';

import './index.scss';

const Board = lazy(() => import('./components/Board'));
const Report = lazy(() => import('./components/Report'));

const GermlineView = (): JSX.Element => {
  const { adminAccess, germlineAccess } = useResource();
  const history = useHistory();

  /* External users cannot access germline reports */
  useEffect(() => {
    if (!germlineAccess && !adminAccess) {
      snackbar.error('User does not have access to Germline reports');
      history.push('/reports');
    }
  }, [germlineAccess, adminAccess, history]);

  return (
    <div className="germline__container">
      <Switch>
        <Route component={Board} exact path="/germline" />
        <Route
          render={(routeProps) => (
            <Report {...routeProps} />
          )}
          path="/germline/report/:ident"
        />
      </Switch>
    </div>
  );
};

export default GermlineView;
