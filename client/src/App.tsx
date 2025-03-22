import React, { useState, useEffect, useRef } from 'react';
import MapView from './components/MapView';
import TrafficLightControl from './components/TrafficLightControl';
import { useMQTT } from './hooks/use-mqtt';
import ErrorBoundary from './components/ErrorBoundary';

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

function MQTTPanel() {
  const { isConnected, devices, error, rawMessages } = useMQTT();
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll cuando hay nuevos mensajes
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Actualizar logs cuando llegan mensajes MQTT
  useEffect(() => {
    const handleMQTTMessage = (message: any) => {
      setLogs(prev => [...prev.slice(-100), `${message.topic} ${message.message}`]);
    };

    window.addEventListener('mqtt-message', (e: any) => handleMQTTMessage(e.detail));
    return () => {
      window.removeEventListener('mqtt-message', (e: any) => handleMQTTMessage(e.detail));
    };
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Estado del Sistema</h2>
        <span className={`px-2 py-1 rounded text-sm ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isConnected ? 'Conectado' : 'Desconectado'}
        </span>
      </div>

      {/* Panel de Logs MQTT */}
      <div className="mb-4 p-2 bg-gray-50 rounded-lg h-60 overflow-auto font-mono text-xs">
        {logs.map((log, i) => (
          <div key={i} className="whitespace-pre">{log}</div>
        ))}
        <div ref={logsEndRef} />
      </div>

      {/* Panel de Dispositivos */}
      {devices.size > 0 && (
        <div className="space-y-4 mt-4">
          <h3 className="text-sm font-semibold">Dispositivos Conectados</h3>
          {Array.from(devices.entries()).map(([deviceId, device]) => (
            <div key={deviceId} className="border rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Vehículos detectados:</span>
                <span className="font-mono bg-gray-50 px-2 py-0.5 rounded">
                  {device.data.cars_detected}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const { devices, isConnected } = useMQTT();
  const [trafficLights, setTrafficLights] = useState<TrafficLightData[]>([]);

  useEffect(() => {
    console.log('Actualizando estado de semáforos:', devices);
    const updatedLights = Array.from(devices.values()).map(device => {
      // Determinar el estado del semáforo basado en los tiempos
      let state: 'red' | 'yellow' | 'green' = 'red';
      if (device.data.time_green && device.data.time_green > 0) {
        state = 'green';
      } else if (device.data.time_yellow && device.data.time_yellow > 0) {
        state = 'yellow';
      }

      return {
        id: parseInt(device.deviceId),
        position: [31.6904, -106.4245], // Posición base
        state,
        iotStatus: device.status,
        inputGreen: device.data.time_green || 30,
        feedbackGreen: device.data.time_green || 0,
        inputRed: device.data.time_red || 45,
        feedbackRed: device.data.time_red || 0
      };
    });
    console.log('Semáforos actualizados:', updatedLights);
    setTrafficLights(updatedLights);
  }, [devices]);

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
            <ErrorBoundary>
              <MapView 
                trafficLights={trafficLights} 
                onPositionChange={handlePositionChange}
              />
            </ErrorBoundary>
          </div>
          <div className="w-96">
            <ErrorBoundary>
              <div className="bg-white p-4 rounded-lg shadow mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Control de Tiempos</h2>
                  <span className={`px-2 py-1 rounded text-sm ${
                    isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isConnected ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>
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
            </ErrorBoundary>

            <ErrorBoundary>
              <MQTTPanel />
            </ErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;