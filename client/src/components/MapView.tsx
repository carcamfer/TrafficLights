import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayerGroup } from 'react-leaflet';
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
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: stateColors[light.state] }}
                        />
                        <span className="capitalize">{light.state}</span>
                      </div>
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