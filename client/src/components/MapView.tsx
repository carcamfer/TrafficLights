import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface TrafficLightColors {
  red: string;
  yellow: string;
  green: string;
}

interface MapViewProps {
  trafficLightColors: TrafficLightColors;
}

const MapView: React.FC<MapViewProps> = ({ trafficLightColors }) => {
  // Coordenadas de Ciudad Juárez
  const position: [number, number] = [31.6904, -106.4245];

  // Definir ubicaciones de semáforos de ejemplo
  const trafficLights = [
    {
      position: [31.6904, -106.4245] as [number, number],
      state: 'red',
      id: 1
    },
    {
      position: [31.6914, -106.4235] as [number, number],
      state: 'green',
      id: 2
    },
    {
      position: [31.6894, -106.4255] as [number, number],
      state: 'yellow',
      id: 3
    }
  ];

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer 
        center={position} 
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
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: trafficLightColors[light.state] }}
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