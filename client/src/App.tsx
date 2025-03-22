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
  const [messages, setMessages] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const handleMQTTMessage = (event: any) => {
      const { topic, message } = event.detail;
      console.log('Nuevo mensaje MQTT recibido:', topic, message);
      setMessages(prev => [...prev.slice(-100), `${topic}: ${message}`]);
    };

    window.addEventListener('mqtt-message', handleMQTTMessage);
    return () => {
      window.removeEventListener('mqtt-message', handleMQTTMessage);
    };
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h2 className="text-lg font-semibold mb-4">Estado del Sistema</h2>
      <div className="font-mono text-xs bg-gray-50 p-2 rounded-lg h-60 overflow-auto">
        {messages.map((msg, i) => (
          <div key={i} className="whitespace-pre">{msg}</div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}

function App() {
  const { devices, isConnected, error } = useMQTT();
  const [trafficLights, setTrafficLights] = useState<TrafficLightData[]>([]);

  useEffect(() => {
    console.log('Actualizando estado de semáforos:', Array.from(devices.values()));
    const updatedLights = Array.from(devices.values()).map(device => ({
      id: parseInt(device.deviceId),
      position: [31.6904, -106.4245] as [number, number],
      state: device.data.time_green && device.data.time_green > 0 ? 'green' :
             device.data.time_yellow && device.data.time_yellow > 0 ? 'yellow' : 'red',
      iotStatus: device.status === 'active' ? 'connected' : 
                device.status === 'inactive' ? 'disconnected' : 'error',
      inputGreen: device.data.time_green || 30,
      feedbackGreen: device.data.time_green || 0,
      inputRed: device.data.time_red || 45,
      feedbackRed: device.data.time_red || 0
    }));

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
                {error && (
                  <div className="mb-4 p-2 bg-red-50 text-red-600 rounded text-sm">
                    {error}
                  </div>
                )}
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