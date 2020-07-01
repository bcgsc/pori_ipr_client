import React, {
  lazy,
} from 'react';
import {
  Switch, Route,
} from 'react-router-dom';

const Board = lazy(() => import('./components/Board'));
const Report = lazy(() => import('./components/Report'));

const GermlineView = () => {
  return (
    <div>
      <Switch>
        <Route component={Board} exact path="/germline" />
        <Route
          render={routeProps => (
            <Report {...routeProps} />
          )}
          path="/germline/report/:ident"
        />
      </Switch>
    </div>
  );
};

export default GermlineView;
