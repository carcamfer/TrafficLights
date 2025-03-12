import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayerGroup, useMap } from 'react-leaflet';
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

// Componente para la capa de tráfico
const TrafficLayer: React.FC = () => {
  const map = useMap();

  React.useEffect(() => {
    // Añadir capa de tráfico
    const trafficLayer = L.tileLayer('https://mt0.google.com/vt/lyrs=traffic|style=15&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    trafficLayer.addTo(map);

    return () => {
      map.removeLayer(trafficLayer);
    };
  }, [map]);

  return null;
};

const MapView: React.FC<MapViewProps> = ({ trafficLights, onPositionChange }) => {
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

        {/* Capa de tráfico */}
        <TrafficLayer />

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