import React, { useState, useEffect } from 'react';
import MapView from './components/MapView';
import TrafficLightControl from './components/TrafficLightControl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMQTT } from './hooks/use-mqtt';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

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

  // Usar el hook de MQTT para comunicación con el servidor
  const { 
    isConnected, 
    iotConnected, 
    logs, 
    feedbackGreen, 
    feedbackRed, 
    currentState, 
    setTrafficLightTime 
  } = useMQTT();

  // Actualizar los semáforos cuando recibimos feedback del servidor
  useEffect(() => {
    if (feedbackGreen > 0 || feedbackRed > 0) {
      // Actualizar para el semáforo #1 (por ahora solo actualizamos el primero)
      setTrafficLights(prev =>
        prev.map(light =>
          light.id === 1 ? { 
            ...light, 
            feedbackGreen: feedbackGreen || light.feedbackGreen,
            feedbackRed: feedbackRed || light.feedbackRed,
            iotStatus: iotConnected ? 'connected' : 'disconnected',
            state: currentState || light.state
          } : light
        )
      );
    }
  }, [feedbackGreen, feedbackRed, iotConnected, currentState]);

  const handleTimeChange = (id: number, type: 'inputGreen' | 'inputRed', value: number) => {
    setTrafficLights(prev =>
      prev.map(light =>
        light.id === id ? { ...light, [type]: value } : light
      )
    );
  };

  const handleSendTime = (id: number, color: 'green' | 'red', value: number) => {
    console.log(`Enviando tiempo ${color}: ${value} para semáforo #${id}`);
    setTrafficLightTime(color, value);
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
        <ResizablePanelGroup direction="horizontal" className="min-h-[600px] border rounded-lg">
          {/* Panel del Mapa */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full p-3">
              <MapView 
                trafficLights={trafficLights} 
                onPositionChange={handlePositionChange}
              />
            </div>
          </ResizablePanel>
          
          <ResizableHandle />
          
          {/* Panel de Control de Tiempos */}
          <ResizablePanel defaultSize={25} minSize={20}>
            <Card className="border-0 shadow-none rounded-none h-full">
              <CardHeader className="px-4 py-2">
                <CardTitle>Control de Tiempos</CardTitle>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-[calc(100vh-160px)] overflow-y-auto pr-2">
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
                      onSendTime={handleSendTime}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </ResizablePanel>
          
          <ResizableHandle />
          
          {/* Panel de Estado del Sistema */}
          <ResizablePanel defaultSize={25} minSize={20}>
            <Card className="border-0 shadow-none rounded-none h-full">
              <CardHeader className="px-4 py-2">
                <CardTitle>Estado del Sistema</CardTitle>
              </CardHeader>
              <CardContent className="px-2">
                <div className="space-y-2">
                  <div className={`px-2 py-1 rounded-md text-sm ${
                    !isConnected ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    WebSocket: {!isConnected ? 'Cargando...' : 'Conectado'}
                  </div>
                  <div className={`px-2 py-1 rounded-md text-sm ${
                    !iotConnected ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    IoT: {!iotConnected ? 'Desconectado' : 'Conectado'}
                  </div>
                  <div className="h-[calc(100vh-200px)] overflow-y-auto space-y-2 text-xs font-mono">
                    {logs.length === 0 ? (
                      <div className="p-2 bg-gray-50 text-gray-500 rounded border border-gray-200">
                        No hay logs disponibles
                      </div>
                    ) : (
                      logs.map((log, index) => (
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
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
}

export default App;