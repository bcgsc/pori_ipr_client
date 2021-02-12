import './index.scss';

import React from 'react';

import Alert from '@material-ui/lab/Alert';


type DemoDescriptionProps = {
    children: React.ReactNode,
};

const DemoDescription = (props: DemoDescriptionProps) => {
  const {
    children,
  } = props;

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
