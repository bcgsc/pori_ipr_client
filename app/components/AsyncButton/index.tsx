import React, { useState, useEffect } from 'react';
import {
  Button,
  CircularProgress,
} from '@material-ui/core';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';

import './index.scss';

type AsyncButtonProps = {
  children: string;
  isLoading: boolean;
  onClick: () => void;
  buttonProps: unknown;
};

const AsyncButton = ({
  children,
  isLoading,
  onClick,
  ...buttonProps
}: AsyncButtonProps): JSX.Element => {
  const [loadingStarted, setLoadingStarted] = useState(false);

  useEffect(() => {
    if (!isLoading && loadingStarted) {
      window.setTimeout(() => setLoadingStarted(false), 3000);
    }
  }, [isLoading, loadingStarted]);

  const handleClick = () => {
    setLoadingStarted(true);
    onClick();
  };

  return (
    <div className="async-button__container">
      <Button
        classes={{label: `${loadingStarted ? 'async-button__label' : 'async-button__label--visible'}`}}
        onClick={handleClick}
        {...buttonProps}
      >
        {children}
        <CircularProgress
          className={`async-button__progress ${isLoading && loadingStarted ? 'async-button__progress--visible' : ''}`}
          size={22}
          color="secondary"
        />
        <CheckCircleIcon
          className={`async-button__success ${!isLoading && loadingStarted ? 'async-button__success--visible' : ''}`}
          color="secondary"
        />
      </Button>
    </div>
  );
};

export default AsyncButton;
