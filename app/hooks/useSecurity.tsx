import { useContext } from 'react';
import { SecurityContext } from '@/context/SecurityContext';

const useSecurity = () => {
  const context = useContext(SecurityContext);

  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }

  return context;
};

export default useSecurity;
