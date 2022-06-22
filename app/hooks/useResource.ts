import { useContext } from 'react';

import ResourceContext, { ResourceContextType } from '@/context/ResourceContext';

const useResource = (): ResourceContextType => useContext(ResourceContext);

export default useResource;
