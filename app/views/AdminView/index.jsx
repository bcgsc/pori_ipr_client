import React, {
  lazy,
} from 'react';
import {
  Switch, Route,
} from 'react-router-dom';

import './index.scss';

const Users = lazy(() => import('./components/Users/index.tsx'));
const Groups = lazy(() => import('./components/Groups/index.tsx'));
const Projects = lazy(() => import('./components/Projects/index.tsx'));

const AdminView = () => (
  <div className="admin">
    <Switch>
      <Route component={Users} path="/admin/users" />
      <Route component={Groups} path="/admin/groups" />
      <Route component={Projects} path="/admin/projects" />
    </Switch>
  </div>
);

export default AdminView;
