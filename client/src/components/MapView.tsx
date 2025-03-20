import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayerGroup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface TrafficLight {
  position: [number, number];
  state: 'red' | 'yellow' | 'green';
  id: number;
  iotStatus: 'connected' | 'disconnected' | 'error';
  inputGreen: number;
  feedbackGreen: number;
  inputRed: number;
  feedbackRed: number;
}

interface MapViewProps {
  trafficLights: TrafficLight[];
  onPositionChange?: (id: number, newPosition: [number, number]) => void;
  onCapture?: (imageData: string) => void;
}

// Crear icono personalizado para los semáforos
const createTrafficLightIcon = (state: 'red' | 'yellow' | 'green') => {
  const svg = `
    <svg width="30" height="30" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="10" width="40" height="80" rx="5" fill="#333" />
      <circle cx="50" cy="30" r="12" fill="${state === 'red' ? '#ff4444' : '#441111'}" />
      <circle cx="50" cy="50" r="12" fill="${state === 'yellow' ? '#ffff44' : '#444411'}" />
      <circle cx="50" cy="70" r="12" fill="${state === 'green' ? '#44ff44' : '#114411'}" />
    </svg>
  `;

  return L.divIcon({
    className: 'traffic-light-icon',
    html: svg,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

// Componente para actualizar la capa de tráfico
const TrafficLayer = () => {
  const map = useMap();
  const [opacity, setOpacity] = useState(0.8);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isUpdating, setIsUpdating] = useState(false);

  const updateTrafficLayer = () => {
    setIsUpdating(true);
    // Forzar actualización de todas las capas de tráfico
    map.eachLayer((layer: any) => {
      if (layer._url?.includes('tomtom')) {
        layer.redraw();
      }
    });
    setLastUpdate(new Date());
    setIsUpdating(false);
  };

  useEffect(() => {
    const interval = setInterval(updateTrafficLayer, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [map]);

  return (
    <>
      <TileLayer
        url={`https://{s}.api.tomtom.com/traffic/map/4/tile/flow/{z}/{x}/{y}.png?key=${import.meta.env.VITE_TOMTOM_API_KEY}&tileSize=256&style=relative&liveTraffic=true&timeValidityMinutes=2`}
        attribution='Traffic Data © <a href="https://www.tomtom.com">TomTom</a>'
        subdomains={['a', 'b', 'c', 'd']}
        maxZoom={22}
        opacity={opacity}
        zIndex={10}
      />
      <div className="absolute bottom-4 right-4 bg-white p-2 rounded shadow z-[1000] text-sm">
        <div className="flex items-center gap-2 mb-2">
          <label className="flex items-center gap-2">
            Opacidad:
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-24"
            />
            {Math.round(opacity * 100)}%
          </label>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className={`w-2 h-2 rounded-full ${isUpdating ? 'bg-green-500' : 'bg-gray-400'}`} />
          Última actualización: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>
    </>
  );
};

const MapView: React.FC<MapViewProps> = ({ trafficLights, onPositionChange }) => {
  // Función para manejar el arrastre de marcadores
  const handleMarkerDragEnd = (id: number, event: any) => {
    const marker = event.target;
    const position = marker.getLatLng();
    onPositionChange?.(id, [position.lat, position.lng]);
  };

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg relative">
      <MapContainer 
        center={trafficLights[0]?.position || [31.6904, -106.4245]} 
        zoom={15} 
        style={{ height: '100%', width: '100%' }}
      >
        {/* Capa base de OpenStreetMap */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Capa de tráfico de TomTom con actualización automática */}
        <TrafficLayer />

        {/* Grupo de marcadores de semáforos */}
        <LayerGroup>
          {trafficLights.map((light) => (
            <Marker 
              key={light.id}
              position={light.position}
              draggable={true}
              icon={createTrafficLightIcon(light.state)}
              eventHandlers={{
                dragend: (e) => handleMarkerDragEnd(light.id, e)
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">Semáforo #{light.id}</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Estado IoT:</span>
                      <span className={`capitalize px-2 py-0.5 rounded text-xs ${
                        light.iotStatus === 'connected' ? 'bg-green-100 text-green-800' :
                        light.iotStatus === 'disconnected' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {light.iotStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Input Verde:</span>
                      <span>{light.inputGreen}s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Feedback Verde:</span>
                      <span>{light.feedbackGreen}s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Input Rojo:</span>
                      <span>{light.inputRed}s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Feedback Rojo:</span>
                      <span>{light.feedbackRed}s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Estado actual:</span>
                      <span className="capitalize">{light.state}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Puedes arrastrar este marcador para mover el semáforo
                  </p>
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