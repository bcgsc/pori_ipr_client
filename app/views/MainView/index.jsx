import React, { lazy, Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import NavBar from '@/components/NavBar/navbar.component';
import Sidebar from '@/components/Sidebar/sidebar.component';

// const Sidebar = lazy(() => import('@/components/Sidebar'));
const TermsView = lazy(() => import('@/views/TermsView'));

/**
 * Entry point to application. Handles routing, app theme, and logged in state.
 */
const Main = () => {
  return (
    <div>
      <NavBar />
      <Sidebar />
    </div>
  );
};

export default Main;
