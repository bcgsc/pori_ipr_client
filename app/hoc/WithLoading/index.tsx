import React, { useState, useCallback } from 'react';

import {
  LinearProgress,
} from '@mui/material';

type WrappedComponentProps = Record<string, unknown>;
type WithLoadingHOCPropsType = Record<string, unknown>;
type WithLoadingReturnType = (props: WithLoadingHOCPropsType) => JSX.Element;

type WithLoadingInjectedProps = {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const WithLoading = (WrappedCompenent: React.FunctionComponent<WrappedComponentProps>)
: WithLoadingReturnType => {
  const HOC = (props: WithLoadingHOCPropsType) => {
    const [isLoading, setIsLoading] = useState(true);

    const setLoadingState = useCallback((isWrappedComponentLoading: boolean) => {
      setIsLoading(isWrappedComponentLoading);
    }, []);

    return (
      <>
        {isLoading && (
          <LinearProgress color="primary" />
        )}
        <WrappedCompenent {...props} isLoading={isLoading} setIsLoading={setLoadingState} />
      </>
    );
  };

  return HOC;
};

export { WithLoadingInjectedProps };

export default WithLoading;
