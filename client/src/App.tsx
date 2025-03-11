import React, { useState } from 'react';
import MapView from './components/MapView';
import TrafficLight from './components/TrafficLight';

function App() {
  const [colors, setColors] = useState({
    red: '#ff0000',
    yellow: '#ffff00',
    green: '#00ff00'
  });

  const handleColorChange = (type: 'red' | 'yellow' | 'green', color: string) => {
    setColors(prev => ({
      ...prev,
      [type]: color
    }));
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
            <MapView trafficLightColors={colors} />
          </div>
          <div className="w-auto">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Personalizar Colores</h2>
              <TrafficLight
                redColor={colors.red}
                yellowColor={colors.yellow}
                greenColor={colors.green}
                onColorChange={handleColorChange}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;