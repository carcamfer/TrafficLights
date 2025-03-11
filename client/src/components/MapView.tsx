import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';

// Definir coordenadas para Ciudad Juárez
const CIUDAD_JUAREZ_COORDS = {
  lat: 31.6904,
  lng: -106.4245
};

const MapView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [currentView, setCurrentView] = useState<{center: L.LatLng, zoom: number} | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      // Inicializar el mapa
      const map = L.map(mapContainerRef.current).setView(
        [CIUDAD_JUAREZ_COORDS.lat, CIUDAD_JUAREZ_COORDS.lng],
        13
      );

      // Añadir capa de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Guardar referencia al mapa
      mapRef.current = map;

      // Evento para actualizar la vista actual
      map.on('moveend', () => {
        if (map) {
          setCurrentView({
            center: map.getCenter(),
            zoom: map.getZoom()
          });
        }
      });
    }

    // Limpiar al desmontar
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handleSaveView = () => {
    if (currentView) {
      // Aquí guardaríamos la vista en algún almacenamiento (localStorage por ahora)
      const savedViews = JSON.parse(localStorage.getItem('savedMapViews') || '[]');
      const newView = {
        id: Date.now(),
        name: `Vista ${savedViews.length + 1}`,
        lat: currentView.center.lat,
        lng: currentView.center.lng,
        zoom: currentView.zoom
      };

      localStorage.setItem('savedMapViews', JSON.stringify([...savedViews, newView]));

      toast({
        title: "Vista guardada",
        description: `Se ha guardado la vista actual del mapa como "${newView.name}"`,
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div ref={mapContainerRef} className="h-[500px] w-full rounded-md border" />
      {currentView && (
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">
              Lat: {currentView.center.lat.toFixed(6)}, Lng: {currentView.center.lng.toFixed(6)}, Zoom: {currentView.zoom}
            </p>
          </div>
          <Button onClick={handleSaveView}>
            Guardar esta vista en el Dashboard
          </Button>
        </div>
      )}
    </div>
  );
};

export default MapView;