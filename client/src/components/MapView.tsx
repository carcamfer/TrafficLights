import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from './ui/button';
import { useToast } from '../components/ui/use-toast';

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  onSaveView?: (view: { center: [number, number], zoom: number }) => void;
}

const MapView: React.FC<MapViewProps> = ({ 
  center = [31.7304, -106.4894], // Ciudad Juárez
  zoom = 13,
  onSaveView 
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      // Initialize map
      mapRef.current = L.map(mapContainerRef.current).setView(center, zoom);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);

      // Add some example markers (e.g., traffic lights)
      const intersections = [
        { pos: [31.7304, -106.4894], name: "Intersection 1" },
        { pos: [31.7404, -106.4794], name: "Intersection 2" },
        { pos: [31.7204, -106.4994], name: "Intersection 3" },
      ];

      intersections.forEach(intersection => {
        L.marker(intersection.pos as [number, number])
          .addTo(mapRef.current!)
          .bindPopup(intersection.name);
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handleSaveView = () => {
    if (mapRef.current && onSaveView) {
      const currentCenter = mapRef.current.getCenter();
      const currentZoom = mapRef.current.getZoom();

      onSaveView({
        center: [currentCenter.lat, currentCenter.lng] as [number, number],
        zoom: currentZoom
      });

      toast({
        title: "Vista guardada",
        description: "La vista actual del mapa ha sido guardada en el dashboard",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={mapContainerRef} className="flex-1 min-h-[400px] w-full" />
      {onSaveView && (
        <div className="mt-4">
          <Button onClick={handleSaveView} className="w-full">
            Guardar esta vista en el Dashboard
          </Button>
        </div>
      )}
    </div>
  );
};

export default MapView;