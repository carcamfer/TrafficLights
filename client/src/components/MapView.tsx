import React, { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';

// Coordenadas de Ciudad Juárez
const CIUDAD_JUAREZ_COORDS = { lat: 31.6904, lng: -106.4245 };

// Datos de muestra para semáforos
const TRAFFIC_LIGHTS = [
  { id: 1, deviceId: 'TL001', greenTime: 30, redTime: 45, status: 'operational', lat: 31.6904, lng: -106.424 },
  { id: 2, deviceId: 'TL002', greenTime: 25, redTime: 40, status: 'operational', lat: 31.6925, lng: -106.422 },
  { id: 3, deviceId: 'TL003', greenTime: 35, redTime: 50, status: 'maintenance', lat: 31.6880, lng: -106.426 },
  { id: 4, deviceId: 'TL004', greenTime: 40, redTime: 60, status: 'operational', lat: 31.6940, lng: -106.430 },
  { id: 5, deviceId: 'TL005', greenTime: 20, redTime: 35, status: 'operational', lat: 31.6850, lng: -106.420 },
];

const MapView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [currentView, setCurrentView] = useState<{center: L.LatLng, zoom: number} | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      try {
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

        // Inicializar la vista actual
        setCurrentView({
          center: map.getCenter(),
          zoom: map.getZoom()
        });

        // Agregar marcadores para los semáforos con un ícono más distintivo
        TRAFFIC_LIGHTS.forEach(light => {
          // Usar un ícono que se parezca a un semáforo vertical
          const trafficLightIcon = L.divIcon({
            html: `
              <div class="w-6 h-12 bg-black border-2 border-white rounded-md flex flex-col items-center justify-between p-1" style="box-shadow: 0 0 0 2px rgba(0,0,0,0.2);">
                <div class="w-4 h-4 bg-red-600 rounded-full"></div>
                <div class="w-4 h-4 bg-yellow-400 rounded-full"></div>
                <div class="w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
            `,
            className: 'traffic-light-icon',
            iconSize: [24, 48],
            iconAnchor: [12, 48] // Punto de anclaje en la base del semáforo
          });

          L.marker([light.lat, light.lng], { icon: trafficLightIcon })
            .addTo(map)
            .bindPopup(`
              <strong>ID: ${light.deviceId}</strong><br/>
              <div class="flex items-center gap-2 mt-1">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Tiempo en verde: ${light.greenTime}s</span>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <div class="w-3 h-3 bg-red-600 rounded-full"></div>
                <span>Tiempo en rojo: ${light.redTime}s</span>
              </div>
              <div class="mt-1">Estado: ${light.status === 'operational' ? 'Operacional' : 'Mantenimiento'}</div>
            `);
        });
      } catch (error) {
        console.error("Error al inicializar el mapa:", error);
        toast({
          title: "Error",
          description: "No se pudo inicializar el mapa",
          variant: "destructive"
        });
      }
    }

    // Limpiar al desmontar
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapContainerRef.current]);

  const handleSaveView = async () => {
    if (currentView && mapRef.current) {
      try {
        // Capturar la imagen del mapa
        const mapElement = mapContainerRef.current;
        if (!mapElement) {
          toast({
            title: "Error",
            description: "No se pudo encontrar el elemento del mapa para capturar",
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Procesando",
          description: "Capturando mapa, por favor espere...",
        });

        // Mejorar la visibilidad de los semáforos antes de la captura
    const trafficLightMarkers = document.querySelectorAll('.traffic-light-icon');
    trafficLightMarkers.forEach(marker => {
      if (marker instanceof HTMLElement) {
        marker.style.zIndex = '1000';
        marker.style.visibility = 'visible';
        marker.style.opacity = '1';
      }
    });

    // Asegurarse de que todos los tiles se hayan cargado antes de capturar
    setTimeout(async () => {
      try {
        // Mejoradas las opciones de captura para mayor precisión
        const canvas = await html2canvas(mapElement, {
          useCORS: true,
          allowTaint: true,
          logging: true,
          scale: 2, // Mayor escala para mejor calidad
          backgroundColor: null,
          imageTimeout: 0, // Sin timeout para imágenes
          ignoreElements: (element) => {
            // Solo ignorar elementos de atribución pero mantener los marcadores
            return element.classList.contains('leaflet-control-attribution') && !element.classList.contains('traffic-light-icon');
          },
          onclone: (documentClone) => {
            // Asegurarse que los elementos del mapa son visibles en el clon
            const clonedMapElement = documentClone.getElementById('map-container');
            if (clonedMapElement) {
              const allIcons = clonedMapElement.querySelectorAll('.leaflet-marker-icon');
              allIcons.forEach(icon => {
                if (icon instanceof HTMLElement) {
                  icon.style.display = 'block';
                  icon.style.visibility = 'visible';
                  icon.style.opacity = '1';
                  icon.style.zIndex = '1000';
                  // Aumentar el tamaño para que sea más visible
                  icon.style.transform = 'scale(1.5)';
                }
              });
            }
          }
        });

        const mapImageUrl = canvas.toDataURL('image/png');

            // Encontrar semáforos cercanos a la vista actual
            const nearbyTrafficLights = TRAFFIC_LIGHTS.filter(light => {
              const distance = mapRef.current?.distance(
                [currentView.center.lat, currentView.center.lng],
                [light.lat, light.lng]
              );
              return distance && distance < 2000; // Dentro de 2km
            });

            // Guardar la vista en localStorage
            const savedViews = JSON.parse(localStorage.getItem('savedMapViews') || '[]');

            const newView = {
              id: Date.now(),
              name: `Intersección ${savedViews.length + 1}`,
              lat: currentView.center.lat,
              lng: currentView.center.lng,
              zoom: currentView.zoom,
              mapImage: mapImageUrl,
              trafficLights: nearbyTrafficLights.map(light => ({
                ...light,
                // Simular datos en tiempo real
                greenTime: Math.floor(Math.random() * 20) + 20,
                redTime: Math.floor(Math.random() * 30) + 30,
                status: Math.random() > 0.2 ? 'operational' : 'maintenance'
              }))
            };

            localStorage.setItem('savedMapViews', JSON.stringify([...savedViews, newView]));
            
            toast({
              title: "Vista guardada",
              description: `Se ha guardado la intersección "${newView.name}" con ${nearbyTrafficLights.length} semáforos`,View]));

            toast({
              title: "Vista guardada",
              description: `Se ha guardado la intersección como "${newView.name}" con ${nearbyTrafficLights.length} semáforos`,
            });
          } catch (error) {
            console.error("Error al capturar la imagen:", error);
            toast({
              title: "Error",
              description: "No se pudo capturar la imagen del mapa",
              variant: "destructive"
            });
          }
        }, 2000); // Aumentado a 2 segundos para asegurar que todos los elementos se carguen
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