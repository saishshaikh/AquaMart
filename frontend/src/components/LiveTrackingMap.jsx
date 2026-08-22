import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import * as maplibregl from 'maplibre-gl'; // ✅ YEH LINE BADLI HAI
import 'maplibre-gl/dist/maplibre-gl.css';
import { serverUrl } from '../App';

const GEOAPIFY_KEY = "YOUR_GEOAPIFY_API_KEY"; 

function LiveTrackingMap({ orderId, deliveryAddress }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const deliveryMarkerRef = useRef(null);
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);

  useEffect(() => {
    if (!map.current && mapContainer.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${GEOAPIFY_KEY}`,
        center: [deliveryAddress?.lng || 72.9781, deliveryAddress?.lat || 19.2183],
        zoom: 12
      });

      map.current.addControl(new maplibregl.NavigationControl(), 'top-left');

      if (deliveryAddress) {
        new maplibregl.Marker({ color: "#FF0000" })
          .setLngLat([deliveryAddress.lng, deliveryAddress.lat])
          .addTo(map.current);
      }
    }
  }, [deliveryAddress]);

  useEffect(() => {
    if (!orderId) return;

    const socket = io(serverUrl);

    socket.on(`location:${orderId}`, (data) => {
      setDeliveryBoyLocation(data);

      if (data && map.current && deliveryMarkerRef.current) {
        deliveryMarkerRef.current.setLngLat([data.lng, data.lat]);
      } else if (data && map.current && !deliveryMarkerRef.current) {
        deliveryMarkerRef.current = new maplibregl.Marker({ color: "#00BFFF" })
          .setLngLat([data.lng, data.lat])
          .addTo(map.current);
      }
    });

    return () => socket.disconnect();
  }, [orderId]);

  return (
    <div className="relative w-full h-72 rounded-2xl border-2 border-cyan-500/30 overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
      {!deliveryBoyLocation && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
          <p className="text-cyan-400 font-semibold">⏳ Waiting for delivery boy location...</p>
        </div>
      )}
    </div>
  );
}

export default LiveTrackingMap;