import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentLocation } from "../redux/mapSlice"; // Aapki existing mapSlice file

const DeliveryMap = ({ userLat, userLng, userAddress }) => {
  const dispatch = useDispatch();
  const mapState = useSelector((state) => state.map);

  // 1️⃣ Map load hote hi Delivery Boy ki Live GPS location fetch karein
  useEffect(() => {
    dispatch(fetchCurrentLocation());
  }, [dispatch]);

  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  // Coordinates
  const boyLat = mapState.latitude;
  const boyLng = mapState.longitude;
  const dropLat = userLat || 19.27407575; // Fallback customer lat
  const dropLng = userLng || 73.1424845;  // Fallback customer lng

  // 2️⃣ Geoapify Static Map Image Generator with 2 Markers (Boy = Blue Marker, Drop = Red Marker)
  const mapImageUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=300&center=lonlat:${boyLng},${boyLat}&zoom=13&marker=lonlat:${boyLng},${boyLat};color:%2300b4d8;size:medium;text:🛵|lonlat:${dropLng},${dropLat};color:%23ff4d6d;size:medium;text:🏠&apiKey=${apiKey}`;

  // 3️⃣ Turn-By-Turn Navigation (Google Maps External App Trigger)
  const handleOpenGoogleMaps = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${boyLat},${boyLng}&destination=${dropLat},${dropLng}&travelmode=driving`,
      "_blank"
    );
  };

  return (
    <div className="w-full my-4 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
      {/* Header Bar */}
      <div className="flex justify-between items-center p-3 bg-slate-800/80 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
          <span className="text-xs font-semibold text-cyan-300">
            {mapState.isLocating ? "Locating Delivery Partner..." : "Geoapify Live Navigation"}
          </span>
        </div>

        <button
          onClick={handleOpenGoogleMaps}
          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg text-xs transition-all flex items-center gap-1 shadow"
        >
          🗺️ Navigate via GPS
        </button>
      </div>

      {/* Map Display Container */}
      <div className="relative w-full h-[220px] bg-slate-950 flex items-center justify-center overflow-hidden">
        {mapState.isLocating ? (
          <div className="text-xs text-slate-400 animate-pulse flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            Detecting exact GPS position...
          </div>
        ) : (
          <img
            src={mapImageUrl}
            alt="Delivery Route Map"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/600x300?text=Map+Location+Error";
            }}
          />
        )}
      </div>

      {/* Footer Location Info */}
      <div className="p-3 bg-slate-900 text-[11px] text-slate-300 space-y-1">
        <p className="flex items-center gap-1">
          <span className="text-cyan-400 font-bold">🛵 Your Position:</span> {mapState.address}
        </p>
        <p className="flex items-center gap-1 text-slate-400">
          <span className="text-rose-400 font-bold">🏠 Drop Address:</span> {userAddress || "Customer Location"}
        </p>
      </div>
    </div>
  );
};

export default DeliveryMap;