import React, { useState } from 'react';
import MapView from './components/MapView';
import TrafficLightControl from './components/TrafficLightControl';

interface TrafficLightData {
  id: number;
  position: [number, number];
  state: 'red' | 'yellow' | 'green';
  iotStatus: 'connected' | 'disconnected' | 'error';
  inputGreen: number;
  feedbackGreen: number;
  inputRed: number;
  feedbackRed: number;
}

function App() {
  const [trafficLights, setTrafficLights] = useState<TrafficLightData[]>([
    {
      id: 1,
      position: [31.6904, -106.4245],
      state: 'red',
      iotStatus: 'connected',
      inputGreen: 30,
      feedbackGreen: 28,
      inputRed: 45,
      feedbackRed: 43
    },
    {
      id: 2,
      position: [31.6914, -106.4235],
      state: 'green',
      iotStatus: 'connected',
      inputGreen: 35,
      feedbackGreen: 33,
      inputRed: 50,
      feedbackRed: 48
    },
    {
      id: 3,
      position: [31.6894, -106.4255],
      state: 'yellow',
      iotStatus: 'error',
      inputGreen: 25,
      feedbackGreen: 0,
      inputRed: 40,
      feedbackRed: 0
    }
  ]);

  const handleTimeChange = (id: number, type: 'inputGreen' | 'inputRed', value: number) => {
    setTrafficLights(prev =>
      prev.map(light =>
        light.id === id ? { ...light, [type]: value } : light
      )
    );
  };

  const handlePositionChange = (id: number, newPosition: [number, number]) => {
    setTrafficLights(prev =>
      prev.map(light =>
        light.id === id ? { ...light, position: newPosition } : light
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
            <MapView 
              trafficLights={trafficLights} 
              onPositionChange={handlePositionChange}
            />
          </div>
          <div className="w-80">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Control de Tiempos</h2>
              {trafficLights.map(light => (
                <TrafficLightControl
                  key={light.id}
                  id={light.id}
                  state={light.state}
                  iotStatus={light.iotStatus}
                  inputGreen={light.inputGreen}
                  feedbackGreen={light.feedbackGreen}
                  inputRed={light.inputRed}
                  feedbackRed={light.feedbackRed}
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