/**
 * @module /Main
 */
import './index.scss';

import {
  CircularProgress,
} from '@material-ui/core';
// import fetchIntercept from 'fetch-intercept';
import React, {
  lazy,
  Suspense, useEffect, useState,
} from 'react';
import {
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';

// import AuthenticatedRoute from '@/components/AuthenticatedRoute';
// import { SecurityContext } from '@/components/SecurityContext';
// import schema from '@/services/schema';
// import config from '@/static/config';

// import MainAppBar from './components/MainAppBar';
// import MainNav from './components/MainNav';

// const AboutView = lazy(() => import('@/views/AboutView'));
// const ActivityView = lazy(() => import('@/views/ActivityView'));
// const AdminView = lazy(() => import('@/views/AdminView'));
// const AdvancedSearchView = lazy(() => import('@/views/AdvancedSearchView'));
// const DataView = lazy(() => import('@/views/DataView'));
// const ErrorView = lazy(() => import('@/views/ErrorView'));
// const FeedbackView = lazy(() => import('@/views/FeedbackView'));
// const ImportPubmedView = lazy(() => import('@/views/ImportPubmedView'));
// const LoginView = lazy(() => import('@/views/LoginView'));
// const NewRecordView = lazy(() => import('@/views/NewRecordView'));
// const NewRecordSelectView = lazy(() => import('@/views/NewRecordSelectView'));
// const PopularSearchView = lazy(() => import('@/views/PopularSearchView'));
// const QuickSearch = lazy(() => import('@/views/QuickSearch'));
// const RecordView = lazy(() => import('@/views/RecordView'));

const {
  ENDPOINTS: { API },
} = CONFIG;


/**
 * Entry point to application. Handles routing, app theme, and logged in state.
 */
const Main = () => {
  return (
    <div className="main-view">
      test
    </div>
  );
};

export default Main;
