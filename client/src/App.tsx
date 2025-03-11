import React, { useState } from 'react';
import MapView from './components/MapView';
import TrafficLight from './components/TrafficLight';
import TrafficLightControl from './components/TrafficLightControl';

interface TrafficLightData {
  id: number;
  position: [number, number];
  state: 'red' | 'yellow' | 'green';
  greenTime: number;
  redTime: number;
}

function App() {
  const [colors, setColors] = useState({
    red: '#ff0000',
    yellow: '#ffff00',
    green: '#00ff00'
  });

  const [trafficLights, setTrafficLights] = useState<TrafficLightData[]>([
    {
      id: 1,
      position: [31.6904, -106.4245],
      state: 'red',
      greenTime: 30,
      redTime: 45
    },
    {
      id: 2,
      position: [31.6914, -106.4235],
      state: 'green',
      greenTime: 35,
      redTime: 50
    },
    {
      id: 3,
      position: [31.6894, -106.4255],
      state: 'yellow',
      greenTime: 25,
      redTime: 40
    }
  ]);

  const handleColorChange = (type: 'red' | 'yellow' | 'green', color: string) => {
    setColors(prev => ({
      ...prev,
      [type]: color
    }));
  };

  const handleTimeChange = (id: number, type: 'greenTime' | 'redTime', value: number) => {
    setTrafficLights(prev =>
      prev.map(light =>
        light.id === id ? { ...light, [type]: value } : light
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4">
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Semáforos</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="flex gap-6">
          <div className="flex-1">
            <MapView trafficLights={trafficLights} trafficLightColors={colors} />
          </div>
          <div className="w-80 space-y-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Personalizar Colores</h2>
              <TrafficLight
                redColor={colors.red}
                yellowColor={colors.yellow}
                greenColor={colors.green}
                onColorChange={handleColorChange}
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Control de Tiempos</h2>
              {trafficLights.map(light => (
                <TrafficLightControl
                  key={light.id}
                  id={light.id}
                  state={light.state}
                  greenTime={light.greenTime}
                  redTime={light.redTime}
                  onTimeChange={handleTimeChange}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;