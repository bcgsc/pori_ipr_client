import React, { useState } from 'react';

import {
  LinearProgress,
} from '@material-ui/core';

type WrappedComponentProps = Record<string, unknown>;
type WithLoadingHOCPropsType = Record<string, unknown>;
type WithLoadingReturnType = (props: WithLoadingHOCPropsType) => JSX.Element;

const WithLoading = (WrappedCompenent: React.FunctionComponent<WrappedComponentProps>)
: WithLoadingReturnType => {
  const HOC = (props: WithLoadingHOCPropsType) => {
    const [isLoading, setIsLoading] = useState(true);

    const setLoadingState = (isWrappedComponentLoading: boolean) => {
      setIsLoading(isWrappedComponentLoading);
    };

    return (
      <>
        {isLoading && (
          <LinearProgress color="secondary" />
        )}
        <WrappedCompenent {...props} setLoading={setLoadingState} />
      </>
    );
  };

  return HOC;
};

export default WithLoading;
