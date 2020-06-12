import React, { lazy } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';

const GenomicSummary = lazy(() => import('./components/GenomicSummary'));

const ReportView = (props) => {
  const match = useRouteMatch();

  return (
    <div>
      <Switch>
        <Route component={GenomicSummary} path={`${match.path}/summary`} />
      </Switch>
    </div>
  );
};

export default ReportView;
