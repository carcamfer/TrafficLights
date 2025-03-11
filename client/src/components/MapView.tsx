import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import html2canvas from 'html2canvas';

interface MapViewProps {
  center: [number, number];
  zoom: number;
  onCapture?: (imageData: string) => void;
}

const MapView: React.FC<MapViewProps> = ({ center, zoom, onCapture }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView(center, zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Marcador de ejemplo para un semáforo
      const trafficLightIcon = L.icon({
        iconUrl: '/attached_assets/semaforo.PNG', // Needs to be a valid path
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      // Añadir semáforos en puntos cercanos a la ubicación central
      L.marker([center[0] + 0.0002, center[1] + 0.0002], { icon: trafficLightIcon })
        .addTo(map)
        .bindPopup('Semáforo 1: Verde 30s, Rojo 45s');

      L.marker([center[0] - 0.0003, center[1] + 0.0001], { icon: trafficLightIcon })
        .addTo(map)
        .bindPopup('Semáforo 2: Verde 25s, Rojo 40s');

      L.marker([center[0], center[1] - 0.0002], { icon: trafficLightIcon })
        .addTo(map)
        .bindPopup('Semáforo 3: Verde 35s, Rojo 50s');

      mapInstanceRef.current = map;
    }
  }, [center, zoom]);

  const captureMap = () => {
    if (mapRef.current && onCapture) {
      html2canvas(mapRef.current, {
        useCORS: true,
        allowTaint: true,
        logging: true,
      }).then(canvas => {
        const imageData = canvas.toDataURL('image/png');
        onCapture(imageData);
      }).catch(error => {
        console.error('Error capturing map:', error);
      });
    }
  };

  return (
    <div className="relative">
      <div ref={mapRef} className="map-container rounded-lg" style={{ height: '500px' }}></div>
      {onCapture && (
        <button
          onClick={captureMap}
          className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow"
        >
          Capturar Vista
        </button>
      )}
    </div>
  );
};

export default MapView;