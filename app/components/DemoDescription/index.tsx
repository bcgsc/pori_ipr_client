import './index.scss';

import React from 'react';

import Alert from '@mui/material/Alert';

type DemoDescriptionProps = {
  children: React.ReactNode,
};

const DemoDescription = ({
  children,
}: DemoDescriptionProps): JSX.Element | null => {
  if (!window._env_.IS_DEMO) {
    return null;
  }

  return (
    <Alert severity="info" className="demo-description">
      {children}
    </Alert>
  );
};

export default DemoDescription;
