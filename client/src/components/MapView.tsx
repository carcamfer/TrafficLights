import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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
}

const MapView: React.FC<MapViewProps> = ({ trafficLights }) => {
  // Colores fijos para los estados de los semáforos
  const stateColors = {
    red: '#ff0000',
    yellow: '#ffff00',
    green: '#00ff00'
  };

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer 
        center={trafficLights[0].position} 
        zoom={15} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {trafficLights.map((light) => (
          <Marker 
            key={light.id}
            position={light.position}
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
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;