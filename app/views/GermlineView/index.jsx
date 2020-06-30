import React, {
  lazy,
  useEffect,
  useState,
} from 'react';
import {
  Switch, Route,
} from 'react-router-dom';

const BoardComponent = lazy(() => import('./components/Board'));
const ReportComponent = lazy(() => import('./components/Report'));

const GermlineView = () => {
  return (
    <div>
      <Switch>
        <Route component={BoardComponent} exact path="/germline" />
        <Route
          render={routeProps => (
            <ReportComponent {...routeProps} />
          )}
          path="/germline/report/:ident"
        />
      </Switch>
    </div>
  );
};

export default GermlineView;
