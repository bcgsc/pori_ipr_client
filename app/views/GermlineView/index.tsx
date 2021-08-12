import React, { lazy, useEffect } from 'react';
import {
  Switch, Route, useHistory,
} from 'react-router-dom';

import useExternalMode from '@/hooks/useExternalMode';
import snackbar from '@/services/SnackbarUtils';
import withLoading from '@/hoc/WithLoading';

import './index.scss';

const Board = lazy(() => import('./components/Board'));
const Report = withLoading(lazy(() => import('./components/Report')));

const GermlineView = (): JSX.Element => {
  const isExternalMode = useExternalMode();
  const history = useHistory();

  /* External users cannot access germline reports */
  useEffect(() => {
    if (isExternalMode) {
      snackbar.error('User does not have access to Germline reports');
      history.push('/reports');
    }
  }, [isExternalMode, history]);

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
