import React, { createContext, ReactChild, useContext } from 'react';

import useResources from '@/hooks/useResources';
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

const useResource = (): ResourceContextType => useContext(ResourceContext);

export {
  ResourceContextProvider,
  useResource,
};

export default ResourceContext;
