import React, { useState, useEffect } from 'react';
import MapView from './components/MapView';
import TrafficLightControl from './components/TrafficLightControl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);

    const connectWebSocket = () => {
      ws.onopen = () => {
        console.log('WebSocket conectado');
        setWsConnected(true);
      };

      ws.onclose = () => {
        console.log('WebSocket desconectado');
        setWsConnected(false);
        // Intentar reconectar después de 5 segundos
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error('Error de WebSocket:', error);
        setWsConnected(false);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'log') {
            const logLines = data.data.split('\n').filter((line: string) => line.trim());
            setSystemLogs(prev => [...logLines].slice(0, 10));
          }
        } catch (error) {
          console.error('Error al procesar mensaje:', error);
        }
      };
    };

    connectWebSocket();

    return () => {
      ws.close();
    };
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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4">
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Semáforos</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="grid grid-cols-12 gap-6">
          {/* Mapa */}
          <div className="col-span-7">
            <MapView 
              trafficLights={trafficLights} 
              onPositionChange={handlePositionChange}
            />
          </div>

          {/* Controles */}
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

          {/* Estado del Sistema */}
          <div className="col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Estado del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className={`px-2 py-1 rounded-md text-sm ${
                    wsConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    WebSocket: {wsConnected ? 'Conectado' : 'Desconectado'}
                  </div>
                  <div className="h-[500px] overflow-y-auto space-y-2 text-xs font-mono">
                    {systemLogs.map((log, index) => (
                      <div 
                        key={index} 
                        className="p-2 bg-gray-50 rounded border border-gray-200 break-all"
                      >
                        {log}
                      </div>
                    ))}
                  </div>
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