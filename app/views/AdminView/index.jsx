import React, {
  lazy,
} from 'react';
import {
  Switch, Route,
} from 'react-router-dom';

import './index.scss';

const Users = lazy(() => import('./components/Users'));
const Groups = lazy(() => import('./components/Groups'));
const Projects = lazy(() => import('./components/Projects'));

const AdminView = () => {
  return (
    <div className="admin">
      <Switch>
        <Route component={Users} path="/admin/users" />
        <Route component={Groups} path="/admin/groups" />
        <Route component={Projects} path="/admin/projects" />
      </Switch>
    </div>
  );
};

export default AdminView;
