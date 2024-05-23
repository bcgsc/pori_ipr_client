import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  ButtonProps,
  CircularProgress,
} from '@mui/material';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import './index.scss';

type AsyncButtonProps = {
  className?: string;
  children?;
  isLoading: boolean;
  onClick?: () => void;
} & ButtonProps<'label', { component?: 'label' }>;

const AsyncButton = ({
  className,
  children,
  isLoading,
  onClick,
  ...buttonProps
}: AsyncButtonProps): JSX.Element => {
  const [loadingStarted, setLoadingStarted] = useState(false);

  useEffect(() => {
    let timeoutReturn;
    if (!isLoading && loadingStarted) {
      timeoutReturn = window.setTimeout(() => setLoadingStarted(false), 3000);
    }
    return () => clearTimeout(timeoutReturn);
  }, [isLoading, loadingStarted]);

  const handleClick = useCallback(() => {
    setLoadingStarted(true);
    if (onClick) {
      onClick();
    }
  }, [onClick]);

  return (
    <div className={`async-button__container ${className}`}>
      <Button
        classes={{ label: `${loadingStarted ? 'async-button__label' : ''}` }}
        className="async-button"
        onClick={handleClick}
        disabled={isLoading}
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
