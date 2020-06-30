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
        <Route component={BoardComponent} path="/" />
        <Route component={ReportComponent} path="/report/:ident" />
      </Switch>
    </div>
  );
};

export default GermlineView;
