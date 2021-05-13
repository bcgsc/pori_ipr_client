import React, {
  lazy,
} from 'react';
import {
  Switch, Route,
} from 'react-router-dom';

import './index.scss';

const Board = lazy(() => import('./components/Board'));
const Report = lazy(() => import('./components/Report'));

const GermlineView = (): JSX.Element => (
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

export default GermlineView;
