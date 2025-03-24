import React, { useState, useEffect } from 'react';
import MapView from './components/MapView';
import TrafficLightControl from './components/TrafficLightControl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrafficLightData } from '@shared/schema';


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

  const [systemLogs, setSystemLogs] = useState<string[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/logs');
        const logs = await response.json();
        setSystemLogs(logs);
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 1000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Traffic Light Control System</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">System Logs</h2>
          <div className="h-64 overflow-y-auto">
            {systemLogs.map((log, index) => (
              <div key={index} className="text-sm py-1 border-b">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;