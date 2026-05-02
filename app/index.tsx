import './publicPath';
import './index.scss';

import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { unregister } from './registerServiceWorker';

const container = document.getElementById('base');
const root = createRoot(container);
root.render(<App />);
unregister();
