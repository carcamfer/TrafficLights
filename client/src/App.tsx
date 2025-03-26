import React, { useState, useEffect } from 'react';
import MapView from './components/MapView';
import TrafficLightControl from './components/TrafficLightControl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query'; // Assuming react-query is used
import mqtt from 'mqtt'; // Importing the MQTT library


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
    },
    {
      id: 4,
      position: [31.6924, -106.4265],
      state: 'red',
      iotStatus: 'connected',
      inputGreen: 40,
      feedbackGreen: 38,
      inputRed: 55,
      feedbackRed: 53
    },
    {
      id: 5,
      position: [31.6884, -106.4225],
      state: 'green',
      iotStatus: 'connected',
      inputGreen: 45,
      feedbackGreen: 43,
      inputRed: 60,
      feedbackRed: 58
    },
    {
      id: 6,
      position: [31.6934, -106.4275],
      state: 'yellow',
      iotStatus: 'disconnected',
      inputGreen: 20,
      feedbackGreen: 0,
      inputRed: 35,
      feedbackRed: 0
    },
    {
      id: 7,
      position: [31.6874, -106.4215],
      state: 'red',
      iotStatus: 'connected',
      inputGreen: 50,
      feedbackGreen: 48,
      inputRed: 65,
      feedbackRed: 63
    },
    {
      id: 8,
      position: [31.6944, -106.4285],
      state: 'green',
      iotStatus: 'error',
      inputGreen: 30,
      feedbackGreen: 0,
      inputRed: 45,
      feedbackRed: 0
    },
    {
      id: 9,
      position: [31.6864, -106.4205],
      state: 'yellow',
      iotStatus: 'connected',
      inputGreen: 35,
      feedbackGreen: 33,
      inputRed: 50,
      feedbackRed: 48
    },
    {
      id: 10,
      position: [31.6954, -106.4295],
      state: 'red',
      iotStatus: 'connected',
      inputGreen: 40,
      feedbackGreen: 38,
      inputRed: 55,
      feedbackRed: 53
    }
  ]);

  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [wsConnected, setWsConnected] = useState(false);

  const { data: logsData, error: logsError, isFetching } = useQuery({
    queryKey: ['logs'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5000/logs');
      if (!response.ok) {
        throw new Error('Error al obtener logs');
      }
      const data = await response.json();
      console.log("Logs recibidos:", data);
      return data;
    },
    refetchInterval: 2000, // Actualizar cada 2 segundos
  });

  useEffect(() => {
    if (logsData?.logs) {
      setSystemLogs(logsData.logs);
    }
  }, [logsData]);

  useEffect(() => {
    const client = mqtt.connect('mqtt://localhost:1883');

    client.on('connect', () => {
      console.log('Conectado al broker MQTT');
      trafficLights.forEach(light => {
        const deviceId = light.id.toString().padStart(8, '0');
        const baseTopic = `smartSemaphore/lora_Device/${deviceId}/info/#`;
        client.subscribe(baseTopic);
      });
    });

    client.on('message', (topic, message) => {
      const topicParts = topic.split('/');
      const deviceId = parseInt(topicParts[2]); // Obtener el ID del dispositivo del tópico

      // Actualizar estado basado en el mensaje MQTT
      if (topic.includes('time/light/green')) {
        const feedbackGreen = parseInt(message.toString());
        setTrafficLights(prev =>
          prev.map(light =>
            light.id === deviceId ? { ...light, feedbackGreen } : light
          )
        );
      } else if (topic.includes('time/light/red')) {
        const feedbackRed = parseInt(message.toString());
        setTrafficLights(prev =>
          prev.map(light =>
            light.id === deviceId ? { ...light, feedbackRed } : light
          )
        );
      } else if (topic.includes('state')) {
        const state = message.toString().toLowerCase() as 'red' | 'yellow' | 'green';
        setTrafficLights(prev =>
          prev.map(light =>
            light.id === deviceId ? { ...light, state } : light
          )
        );
      } else if (topic.includes('status/iot')) {
        const iotStatus = message.toString().toLowerCase() as 'connected' | 'disconnected' | 'error';
        setTrafficLights(prev =>
          prev.map(light =>
            light.id === deviceId ? { ...light, iotStatus } : light
          )
        );
      }
    });

    return () => {
      client.end();
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
          <div className="col-span-6">
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
                <div className="space-y-4 h-[500px] overflow-y-auto pr-2">
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

          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Estado del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className={`px-2 py-1 rounded-md text-sm ${
                    isFetching ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    WebSocket: {isFetching ? 'Cargando...' : 'Conectado'}
                  </div>
                  <div className="h-[500px] overflow-y-auto space-y-2 text-xs font-mono">
                    {logsError ? (
                      <div className="p-2 bg-red-50 text-red-800 rounded border border-red-200">
                        Error al cargar logs: {logsError.message}
                      </div>
                    ) : systemLogs.length === 0 ? (
                      <div className="p-2 bg-gray-50 text-gray-500 rounded border border-gray-200">
                        No hay logs disponibles
                      </div>
                    ) : (
                      systemLogs.map((log, index) => (
                        <div
                          key={index}
                          className="p-2 bg-gray-50 rounded border border-gray-200 break-all hover:bg-gray-100"
                        >
                          {log}
                        </div>
                      ))
                    )}
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