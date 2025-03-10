
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function CiudadJuarezMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Coordenadas de Ciudad Juárez
    const ciudadJuarezCoords = [31.690, -106.424];
    
    // Initialize map if it doesn't exist
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView(ciudadJuarezCoords, 13);
      
      // Añadir capa de mapa base
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Añadir marcador en el centro de Ciudad Juárez
      L.marker(ciudadJuarezCoords)
        .addTo(map)
        .bindPopup('<b>Ciudad Juárez</b><br>Centro de la ciudad')
        .openPopup();
        
      // Simular zonas de tráfico (solo visual)
      // Zona 1 - Alto tráfico
      L.circle([31.690, -106.424], {
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.3,
          radius: 1500
      }).addTo(map).bindPopup('Zona de alto tráfico');
      
      // Zona 2 - Tráfico moderado
      L.circle([31.675, -106.440], {
          color: 'orange',
          fillColor: '#ffa500',
          fillOpacity: 0.3,
          radius: 1200
      }).addTo(map).bindPopup('Zona de tráfico moderado');
      
      // Zona 3 - Tráfico ligero
      L.circle([31.705, -106.410], {
          color: 'green',
          fillColor: '#3f6',
          fillOpacity: 0.3,
          radius: 1000
      }).addTo(map).bindPopup('Zona de tráfico ligero');
      
      mapInstanceRef.current = map;
    }
    
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mapa de Ciudad Juárez</h1>
      <div ref={mapRef} className="map-container rounded-md shadow-lg border" style={{ height: '600px' }} />
      <div className="mt-4 p-4 bg-gray-100 rounded-md">
        <h2 className="text-xl mb-2">Información de tráfico</h2>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span>Alto tráfico</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
            <span>Tráfico moderado</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span>Tráfico ligero</span>
          </div>
        </div>
      </div>
    </div>
  );
}
