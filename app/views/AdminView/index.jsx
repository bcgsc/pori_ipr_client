import React, {
  lazy,
} from 'react';
import {
  Switch, Route,
} from 'react-router-dom';

import './index.scss';

const Users = lazy(() => import('./components/Users/index.tsx'));
const Groups = lazy(() => import('./components/Groups/index.tsx'));
const Projects = lazy(() => import('../ProjectsView/index.tsx'));
const Appendices = lazy(() => import('./components/Appendices/index'));
const VariantText = lazy(() => import('../VariantTextView/index'));

const AdminView = () => (
  <div className="admin">
    <Switch>
      <Route component={Users} path="/admin/users" />
      <Route component={Groups} path="/admin/groups" />
      <Route component={Projects} path="/admin/projects" />
      <Route component={Appendices} path="/admin/appendices" />
      <Route component={VariantText} path="/admin/variant-text" />
    </Switch>
  </div>
);

export default AdminView;
