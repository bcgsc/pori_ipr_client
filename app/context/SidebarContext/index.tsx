import React from 'react';

import SidebarContextType from './types';

const SidebarContext = React.createContext<SidebarContextType>({
  sidebarMaximized: false,
  setSidebarMaximized: () => {},
});

export default SidebarContext;
