import { useState, useEffect } from 'react';

export const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState('desktop');

  useEffect(() => {
    const checkDeviceType = () => {
      const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;
      const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

      if (isMobileViewport && isCoarsePointer) {
        setDeviceType('mobile');
      } else {
        setDeviceType('desktop');
      }
    };

    checkDeviceType();

    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  return deviceType;
};
