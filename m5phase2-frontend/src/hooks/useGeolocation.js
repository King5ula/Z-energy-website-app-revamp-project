import { useState, useCallback } from 'react';

export const useGeolocation = (onSuccess) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setHasPermission(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setHasPermission(true);
        setError(null);
        if (onSuccess) {
          onSuccess(location);
        }
      },
      (err) => {
        setHasPermission(false);
        setError(err.message);
        console.error('Geolocation error:', err);
      }
    );
  }, [onSuccess]);

  return {
    requestLocation,
    hasPermission,
    error
  };
};
