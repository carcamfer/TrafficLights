import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface TrafficLight {
  position: [number, number];
  state: 'red' | 'yellow' | 'green';
  id: number;
  greenTime: number;
  redTime: number;
}

interface MapViewProps {
  trafficLights: TrafficLight[];
  onPositionChange?: (id: number, newPosition: [number, number]) => void;
}

const MapView: React.FC<MapViewProps> = ({ trafficLights, onPositionChange }) => {
  // Verificar que la API key está disponible
  useEffect(() => {
    console.log('TomTom API Key:', import.meta.env.VITE_TOMTOM_API_KEY);
  }, []);

  // Colores fijos para los estados de los semáforos
  const stateColors = {
    red: '#ff0000',
    yellow: '#ffff00',
    green: '#00ff00'
  };

  const handleMarkerDragEnd = (id: number, event: any) => {
    const marker = event.target;
    const position = marker.getLatLng();
    onPositionChange?.(id, [position.lat, position.lng]);
  };

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer 
        center={trafficLights[0].position} 
        zoom={15} 
        style={{ height: '100%', width: '100%' }}
      >
        {/* Capa base de OpenStreetMap */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Capa de tráfico de TomTom */}
        <TileLayer
          url={`https://{s}.api.tomtom.com/traffic/map/4/tile/flow/{z}/{x}/{y}.png?key=${import.meta.env.VITE_TOMTOM_API_KEY}`}
          attribution='Traffic Data © <a href="https://www.tomtom.com">TomTom</a>'
          subdomains={['a', 'b', 'c', 'd']}
          maxZoom={22}
          opacity={0.8}
          zIndex={10}
          eventHandlers={{
            tileerror: (error) => {
              console.error('Error loading TomTom traffic tiles:', error);
            },
            tileload: () => {
              console.log('TomTom traffic tile loaded successfully');
            }
          }}
        />

        {/* Grupo de marcadores de semáforos */}
        <LayerGroup>
          {trafficLights.map((light) => (
            <Marker 
              key={light.id}
              position={light.position}
              draggable={true}
              eventHandlers={{
                dragend: (e) => handleMarkerDragEnd(light.id, e)
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">Semáforo #{light.id}</h3>
                  <div className="mt-2">
                    <div 
                      className="w-4 h-4 rounded-full mb-2" 
                      style={{ backgroundColor: stateColors[light.state] }}
                    />
                    <p>Estado actual: {light.state}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Puedes arrastrar este marcador para mover el semáforo
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </LayerGroup>
      </MapContainer>
    </div>
  );
};

export default MapView;