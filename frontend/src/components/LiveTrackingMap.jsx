import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { serverUrl } from '../App';
import { Navigation, MapPin, Truck, AlertCircle, Compass } from 'lucide-react';

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIKEY;

function LiveTrackingMap({ orderId, deliveryAddress }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const deliveryMarkerRef = useRef(null);
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);
  const [mapError, setMapError] = useState(false);

  // Safe parsing helper
  const parseNum = (val, fallback) => {
    if (val === null || val === undefined) return fallback;
    const n = Number(val);
    return isNaN(n) ? fallback : n;
  };

  const userLng = parseNum(deliveryAddress?.lng, 73.1268);
  const userLat = parseNum(deliveryAddress?.lat, 19.2348);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    try {
      const mapStyle = GEOAPIFY_KEY && GEOAPIFY_KEY.trim() !== ''
        ? `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${GEOAPIFY_KEY}`
        : {
            version: 8,
            sources: {
              'osm-tiles': {
                type: 'raster',
                tiles: [
                  'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                  'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png'
                ],
                tileSize: 256,
                attribution: '&copy; OpenStreetMap'
              }
            },
            layers: [
              {
                id: 'osm-tiles-layer',
                type: 'raster',
                source: 'osm-tiles',
                minzoom: 0,
                maxzoom: 19
              }
            ]
          };

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: [userLng, userLat],
        zoom: 13
      });

      map.current.addControl(new maplibregl.NavigationControl(), 'top-left');

      // Add User Drop Marker
      if (!isNaN(userLng) && !isNaN(userLat)) {
        new maplibregl.Marker({ color: "#FF0000" })
          .setLngLat([userLng, userLat])
          .setPopup(new maplibregl.Popup().setText("🏠 Your Delivery Address"))
          .addTo(map.current);
      }
    } catch (err) {
      console.warn("MapLibre initialization warning:", err);
      setMapError(true);
    }

    return () => {
      if (map.current) {
        try {
          map.current.remove();
        } catch (e) {
          // ignore
        }
        map.current = null;
      }
    };
  }, [userLng, userLat]);

  useEffect(() => {
    if (!orderId) return;

    let socket;
    try {
      socket = io(serverUrl);

      socket.on(`location:${orderId}`, (data) => {
        if (!data) return;
        const bLng = parseNum(data.lng, null);
        const bLat = parseNum(data.lat, null);

        if (bLng !== null && bLat !== null) {
          setDeliveryBoyLocation({ lng: bLng, lat: bLat });

          if (map.current) {
            try {
              if (deliveryMarkerRef.current) {
                deliveryMarkerRef.current.setLngLat([bLng, bLat]);
              } else {
                deliveryMarkerRef.current = new maplibregl.Marker({ color: "#00BFFF" })
                  .setLngLat([bLng, bLat])
                  .setPopup(new maplibregl.Popup().setText("🛵 Delivery Partner"))
                  .addTo(map.current);
              }
            } catch (markerErr) {
              console.warn("Marker update error:", markerErr);
            }
          }
        }
      });
    } catch (err) {
      console.warn("Socket connection error:", err);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [orderId]);

  const handleOpenGoogleMaps = () => {
    const origin = deliveryBoyLocation 
      ? `${deliveryBoyLocation.lat},${deliveryBoyLocation.lng}` 
      : `${userLat + 0.01},${userLng + 0.01}`;
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${userLat},${userLng}&travelmode=driving`,
      "_blank"
    );
  };

  if (mapError) {
    return (
      <div className="relative w-full h-72 rounded-2xl border border-cyan-500/30 bg-slate-950 p-5 flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
          <Truck className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h5 className="text-sm font-bold text-white">Live GPS Dispatch Active</h5>
          <p className="text-xs text-slate-400 mt-1">Delivery partner is on the way with temperature-controlled chill pack.</p>
        </div>
        <button
          onClick={handleOpenGoogleMaps}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
        >
          <Navigation size={13} /> Open Live Route on Google Maps
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-72 rounded-2xl border-2 border-cyan-500/30 overflow-hidden bg-slate-950">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
      
      {!deliveryBoyLocation && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/75 backdrop-blur-[2px] z-10 p-4 text-center">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-cyan-400 font-bold text-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Connecting to Delivery Partner GPS...</span>
            </div>
            <p className="text-[11px] text-slate-400">Coordinates locked to destination address</p>
          </div>
        </div>
      )}

      {/* Floating GPS Action Bar */}
      <div className="absolute bottom-3 right-3 z-20">
        <button
          onClick={handleOpenGoogleMaps}
          className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-1.5 transition-all"
        >
          <Compass size={13} className="text-cyan-400" />
          <span>Full Route</span>
        </button>
      </div>
    </div>
  );
}

export default LiveTrackingMap;