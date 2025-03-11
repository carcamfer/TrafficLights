
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  onSaveView?: (viewData: { center: [number, number], zoom: number }) => void;
}

const MapView: React.FC<MapViewProps> = ({ 
  center = [31.6904, -106.4245], // Ciudad Juárez coordinates
  zoom = 13,
  onSaveView 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (mapContainer.current && !mapInstance.current) {
      // Initialize the map
      mapInstance.current = L.map(mapContainer.current).setView(center, zoom);
      
      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);
      
      // Add some markers for demonstration
      L.marker([31.6904, -106.4245]).addTo(mapInstance.current)
        .bindPopup('Centro de Ciudad Juárez')
        .openPopup();
      
      L.marker([31.7233, -106.4601]).addTo(mapInstance.current)
        .bindPopup('Punto de Monitoreo Norte');
      
      L.marker([31.6584, -106.3921]).addTo(mapInstance.current)
        .bindPopup('Punto de Monitoreo Este');
      
      // Traffic circles with different colors representing congestion levels
      L.circle([31.6804, -106.4145], {
        color: 'green',
        fillColor: 'green',
        fillOpacity: 0.5,
        radius: 500
      }).addTo(mapInstance.current).bindPopup('Tráfico Bajo');
      
      L.circle([31.7033, -106.4301], {
        color: 'yellow',
        fillColor: 'yellow',
        fillOpacity: 0.5,
        radius: 500
      }).addTo(mapInstance.current).bindPopup('Tráfico Moderado');
      
      L.circle([31.6684, -106.4521], {
        color: 'red',
        fillColor: 'red',
        fillOpacity: 0.5,
        radius: 500
      }).addTo(mapInstance.current).bindPopup('Tráfico Alto');
    }
    
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);
  
  const handleSaveView = () => {
    if (mapInstance.current) {
      const currentCenter = mapInstance.current.getCenter();
      const currentZoom = mapInstance.current.getZoom();
      
      const viewData = {
        center: [currentCenter.lat, currentCenter.lng] as [number, number],
        zoom: currentZoom
      };
      
      if (onSaveView) {
        onSaveView(viewData);
        toast({
          title: "Vista guardada",
          description: "Esta vista ha sido guardada en el dashboard",
        });
      }
    }
  };
  
  return (
    <div className="relative">
      <div ref={mapContainer} style={{ height: '500px', width: '100%' }}></div>
      {onSaveView && (
        <div className="absolute bottom-4 right-4 z-[1000]">
          <Button onClick={handleSaveView} variant="default">
            Guardar esta vista en Dashboard
          </Button>
        </div>
      )}
    </div>
  );
};

export default MapView;
