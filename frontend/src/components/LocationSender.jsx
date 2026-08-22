import { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { serverUrl } from '../App';

function LocationSender({ activeOrderId }) {
  const watchId = useRef(null);

  useEffect(() => {
    if (!activeOrderId) return;

    const socket = io(serverUrl);

    if (navigator.geolocation) {
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          socket.emit('update-location', { 
            orderId: activeOrderId, 
            lat: latitude, 
            lng: longitude 
          });
        },
        (error) => console.error("GPS Error:", error),
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
      );
    }

    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
      socket.disconnect();
    };
  }, [activeOrderId]);

  return null;
}

export default LocationSender;