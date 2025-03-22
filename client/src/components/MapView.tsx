import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayerGroup } from 'react-leaflet';
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
}

// Update the createTrafficLightIcon function
const createTrafficLightIcon = (state: 'red' | 'yellow' | 'green') => {
  const getColor = (lightState: 'red' | 'yellow' | 'green') => {
    const colors = {
      red: state === 'red' ? '#ef4444' : '#441111',
      yellow: state === 'yellow' ? '#facc15' : '#444411',
      green: state === 'green' ? '#22c55e' : '#114411'
    };
    return colors[lightState];
  };

  const svg = `
    <svg width="30" height="30" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect x="30" y="10" width="40" height="80" rx="5" fill="#333" />
      <circle cx="50" cy="30" r="12" fill="${getColor('red')}" filter="${state === 'red' ? 'url(#glow)' : ''}" />
      <circle cx="50" cy="50" r="12" fill="${getColor('yellow')}" filter="${state === 'yellow' ? 'url(#glow)' : ''}" />
      <circle cx="50" cy="70" r="12" fill="${getColor('green')}" filter="${state === 'green' ? 'url(#glow)' : ''}" />
    </svg>
  `;

  return L.divIcon({
    className: 'traffic-light-icon',
    html: svg,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

const MapView: React.FC<MapViewProps> = ({ trafficLights, onPositionChange }) => {
  // Función para manejar el arrastre de marcadores
  const handleMarkerDragEnd = (id: number, event: any) => {
    const marker = event.target;
    const position = marker.getLatLng();
    onPositionChange?.(id, [position.lat, position.lng]);
  };

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg">
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