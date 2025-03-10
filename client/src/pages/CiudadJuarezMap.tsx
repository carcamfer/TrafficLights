import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CiudadJuarezMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize the map
    const map = L.map(mapRef.current).setView([31.6904, -106.4245], 12);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Example marker
    L.marker([31.6904, -106.4245])
      .addTo(map)
      .bindPopup('Ciudad Juárez, Mexico')
      .openPopup();

    // Clean up on unmount
    return () => {
      map.remove();
    };
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Ciudad Juárez Map</h1>
      <div ref={mapRef} className="map-container rounded-lg shadow-lg" />
    </div>
  );
};

export default CiudadJuarezMap;