import React, {
  lazy,
} from 'react';
import {
  Switch, Route,
} from 'react-router-dom';

const Users = lazy(() => import('./components/Users'));
const Groups = lazy(() => import('./components/Groups'));
const Projects = lazy(() => import('./components/Projects'));

const AdminView = () => {
  return (
    <Switch>
      <Route component={Users} path="/users" />
      <Route component={Groups} path="/groups" />
      <Route component={Projects} path="/projects" />
    </Switch>
  );
};

export default AdminView;
