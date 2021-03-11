import React, { useState, useEffect } from 'react';
import {
  Button,
  ButtonProps,
  CircularProgress,
} from '@material-ui/core';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';

import './index.scss';

type AsyncButtonProps = {
  className?: string;
  children;
  isLoading: boolean;
  onClick?: () => void;
} & ButtonProps;

const AsyncButton = ({
  className,
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
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className={`async-button__container ${className}`}>
      <Button
        classes={{ label: `${loadingStarted ? 'async-button__label' : ''}` }}
        className="async-button"
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
