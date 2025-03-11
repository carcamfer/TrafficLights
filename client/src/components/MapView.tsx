import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';
import html2canvas from 'html2canvas';

// Definir coordenadas para Ciudad Juárez
const CIUDAD_JUAREZ_COORDS = {
  lat: 31.6904,
  lng: -106.4245
}

// Datos simulados de semáforos
const TRAFFIC_LIGHTS = [
  { 
    id: 1, 
    lat: 31.6904, 
    lng: -106.4245,
    greenTime: 45,
    redTime: 60,
    deviceId: "IOT-001",
    status: "online"
  },
  { 
    id: 2, 
    lat: 31.6920, 
    lng: -106.4270,
    greenTime: 30,
    redTime: 50,
    deviceId: "IOT-002",
    status: "online"
  },
  { 
    id: 3, 
    lat: 31.6880, 
    lng: -106.4230,
    greenTime: 40,
    redTime: 55,
    deviceId: "IOT-003",
    status: "offline"
  }
];

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

  const handleSaveView = async () => {
    if (currentView && mapRef.current) {
      try {
        // Capturar la imagen del mapa
        const mapElement = mapContainerRef.current;
        if (!mapElement) return;
        
        const canvas = await html2canvas(mapElement);
        const mapImageUrl = canvas.toDataURL('image/png');
        
        // Encontrar semáforos cercanos a la vista actual
        const nearbyTrafficLights = TRAFFIC_LIGHTS.filter(light => {
          const distance = mapRef.current?.distance(
            [currentView.center.lat, currentView.center.lng],
            [light.lat, light.lng]
          );
          return distance && distance < 2000; // Dentro de 2km
        });
        
        // Aquí guardaríamos la vista en algún almacenamiento (localStorage por ahora)
        const savedViews = JSON.parse(localStorage.getItem('savedMapViews') || '[]');
        const newView = {
          id: Date.now(),
          name: `Intersección ${savedViews.length + 1}`,
          lat: currentView.center.lat,
          lng: currentView.center.lng,
          zoom: currentView.zoom,
          mapImage: mapImageUrl,
          trafficLights: nearbyTrafficLights
        };

        localStorage.setItem('savedMapViews', JSON.stringify([...savedViews, newView]));

        toast({
          title: "Vista guardada",
          description: `Se ha guardado la intersección como "${newView.name}" con ${nearbyTrafficLights.length} semáforos`,
        });
      } catch (error) {
        console.error("Error al guardar la vista:", error);
        toast({
          title: "Error",
          description: "No se pudo guardar la vista del mapa",
          variant: "destructive"
        });
      }
    }
  };

  // Agregar marcadores para los semáforos
  useEffect(() => {
    if (mapRef.current) {
      // Icono personalizado para semáforos
      const trafficLightIcon = L.divIcon({
        html: `<div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">S</div>`,
        className: 'traffic-light-icon',
        iconSize: [24, 24]
      });

      // Añadir marcadores para cada semáforo
      TRAFFIC_LIGHTS.forEach(light => {
        const marker = L.marker([light.lat, light.lng], { icon: trafficLightIcon })
          .addTo(mapRef.current!);
          
        // Popup con información del semáforo
        marker.bindPopup(`
          <div class="p-2">
            <h3 class="font-bold">Semáforo ID: ${light.deviceId}</h3>
            <p>Tiempo Verde: ${light.greenTime}s</p>
            <p>Tiempo Rojo: ${light.redTime}s</p>
            <p>Estado: ${light.status === 'online' ? 'En línea' : 'Desconectado'}</p>
          </div>
        `);
      });
    }
  }, [mapRef.current]);

  return (
    <div className="flex flex-col gap-4">
      <div id="map-container" ref={mapContainerRef} className="h-[500px] w-full rounded-md border" />
      {currentView && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Lat: {currentView.center.lat.toFixed(6)}, Lng: {currentView.center.lng.toFixed(6)}, Zoom: {currentView.zoom}
            </p>
            <p className="text-sm text-muted-foreground">
              Semáforos cercanos: {TRAFFIC_LIGHTS.filter(light => {
                const distance = mapRef.current?.distance(
                  [currentView.center.lat, currentView.center.lng],
                  [light.lat, light.lng]
                );
                return distance && distance < 2000;
              }).length}
            </p>
          </div>
          <Button onClick={handleSaveView}>
            Guardar esta intersección en el Dashboard
          </Button>
        </div>
      )}
    </div>
  );
};

export default MapView;