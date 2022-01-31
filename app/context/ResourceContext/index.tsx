import React, { createContext, ReactChild } from 'react';

import { useResources } from '@/hooks/useResource';
import ResourceContextType from './types';

const ResourceContext = createContext<ResourceContextType>({
  germlineAccess: false,
  reportAccess: false,
  adminAccess: false,
});

type ResourceContextProviderProps = {
  children: ReactChild,
};

const ResourceContextProvider = ({ children }: ResourceContextProviderProps): JSX.Element => {
  const { germlineAccess, reportAccess, adminAccess } = useResources();

  return (
    <ResourceContext.Provider value={{ germlineAccess, reportAccess, adminAccess }}>
      {children}
    </ResourceContext.Provider>
  );
};

export type {
  ResourceContextType,
};

export {
  ResourceContextProvider,
};

export default ResourceContext;
