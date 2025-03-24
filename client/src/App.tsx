import React, { useState, useEffect } from 'react';
import MapView from './components/MapView';
import TrafficLightControl from './components/TrafficLightControl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrafficLightData } from '@shared/schema';

function App() {
  const [trafficLights, setTrafficLights] = useState<TrafficLightData[]>([]);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    let ws: WebSocket;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${protocol}//${window.location.host}`);

      ws.onopen = () => {
        console.log('WebSocket conectado');
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'log') {
            const logLines = data.data.split('\n').filter((line: string) => line.trim());
            setSystemLogs(logLines);
          }
        } catch (error) {
          console.error('Error al procesar mensaje:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket desconectado');
        setWsConnected(false);
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error('Error de WebSocket:', error);
      };
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const handlePositionChange = (id: string, lat: number, lng: number) => {
    setTrafficLights(prev => 
      prev.map(light => 
        light.id === id ? { ...light, lat, lng } : light
      )
    );
  };

  const handleTimeChange = (id: string, color: 'red' | 'green', time: number) => {
    setTrafficLights(prev => 
      prev.map(light => 
        light.id === id 
          ? { 
              ...light, 
              [`input${color.charAt(0).toUpperCase() + color.slice(1)}`]: time 
            } 
          : light
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
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-7">
            <MapView 
              trafficLights={trafficLights} 
              onPositionChange={handlePositionChange}
            />
          </div>

          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Control de Tiempos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
              </CardContent>
            </Card>
          </div>

          <div className="col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Logs del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] overflow-y-auto space-y-2">
                  {systemLogs.map((log, index) => (
                    <div 
                      key={index} 
                      className="p-2 bg-gray-50 rounded border border-gray-200 font-mono text-xs whitespace-pre-wrap"
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;