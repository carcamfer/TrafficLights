import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface TrafficLightColors {
  red: string;
  yellow: string;
  green: string;
}

interface TrafficLight {
  position: [number, number];
  state: 'red' | 'yellow' | 'green';
  id: number;
  greenTime: number;
  redTime: number;
}

interface MapViewProps {
  trafficLightColors: TrafficLightColors;
}

const MapView: React.FC<MapViewProps> = ({ trafficLightColors }) => {
  // Coordenadas de Ciudad Juárez
  const position: [number, number] = [31.6904, -106.4245];

  // Estado para los semáforos
  const [trafficLights, setTrafficLights] = useState<TrafficLight[]>([
    {
      position: [31.6904, -106.4245],
      state: 'red',
      id: 1,
      greenTime: 30,
      redTime: 45
    },
    {
      position: [31.6914, -106.4235],
      state: 'green',
      id: 2,
      greenTime: 35,
      redTime: 50
    },
    {
      position: [31.6894, -106.4255],
      state: 'yellow',
      id: 3,
      greenTime: 25,
      redTime: 40
    }
  ]);

  const handleTimeChange = (id: number, type: 'greenTime' | 'redTime', value: number) => {
    setTrafficLights(prevLights =>
      prevLights.map(light =>
        light.id === id ? { ...light, [type]: value } : light
      )
    );
  };

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
                    className="w-4 h-4 rounded-full mb-2" 
                    style={{ backgroundColor: trafficLightColors[light.state] }}
                  />
                  <p>Estado actual: {light.state}</p>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm">Tiempo en verde (s):</label>
                      <input
                        type="number"
                        min="1"
                        className="border rounded px-2 py-1 w-20"
                        value={light.greenTime}
                        onChange={(e) => handleTimeChange(light.id, 'greenTime', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm">Tiempo en rojo (s):</label>
                      <input
                        type="number"
                        min="1"
                        className="border rounded px-2 py-1 w-20"
                        value={light.redTime}
                        onChange={(e) => handleTimeChange(light.id, 'redTime', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
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