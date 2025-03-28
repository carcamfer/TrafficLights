import React, { useState, useEffect } from 'react';
import MapView from './components/MapView';
import TrafficLightControl from './components/TrafficLightControl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMQTT } from './hooks/use-mqtt';
import { Toaster, toast } from 'sonner';

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

  const { isConnected, logs, publish } = useMQTT();

  const handleTimeChange = (id: number, type: 'inputGreen' | 'inputRed', value: number) => {
    // Actualizar el estado local primero
    setTrafficLights(prev =>
      prev.map(light =>
        light.id === id ? { ...light, [type]: value } : light
      )
    );

    // Determinar el color basado en el tipo
    const color = type === 'inputGreen' ? 'green' : 'red';
    
    // Publicar el cambio vía MQTT
    const success = publish({
      deviceId: id,
      color: color,
      value: value
    });

    if (success) {
      toast.success("Cambio enviado", {
        description: `Semáforo #${id}: Tiempo de ${color === 'green' ? 'verde' : 'rojo'} actualizado a ${value}s`,
        duration: 3000
      });
    } else {
      toast.error("Error al enviar", {
        description: "No se pudo enviar el comando al semáforo. Revise la conexión.",
        duration: 5000
      });
    }
  };

  const handlePositionChange = (id: number, newPosition: [number, number]) => {
    setTrafficLights(prev =>
      prev.map(light =>
        light.id === id ? { ...light, position: newPosition } : light
      )
    );
  };

  // Actualizar el feedback cuando se reciban nuevos mensajes MQTT
  useEffect(() => {
    // Aquí podrías procesar los logs y actualizar los valores de feedback
    // Formato esperado de logs: "smartSemaphore/lora_Device/00000001/info/time/light/red 40"
    if (logs && logs.length > 0) {
      // Hacer una copia del estado actual
      const updatedLights = [...trafficLights];
      let hasUpdates = false;

      logs.forEach(log => {
        const parts = log.split(' ');
        if (parts.length !== 2) return; // Formato inválido

        const topic = parts[0];
        const value = parseInt(parts[1]);
        if (isNaN(value)) return; // Valor no numérico

        // Extraer deviceId y tipo de luz del topic
        // Formato: smartSemaphore/lora_Device/<device_id>/info/time/light/<color>
        const topicParts = topic.split('/');
        if (topicParts.length < 7) return; // Formato de topic inválido

        const deviceIdStr = topicParts[2];
        const colorStr = topicParts[6];

        if (!deviceIdStr || !colorStr) return;

        // Convertir deviceId a número (eliminando ceros iniciales)
        const deviceId = parseInt(deviceIdStr);
        if (isNaN(deviceId)) return;

        // Encontrar el semáforo correspondiente
        const lightIndex = updatedLights.findIndex(light => light.id === deviceId);
        if (lightIndex === -1) return; // Semáforo no encontrado

        // Actualizar el valor de feedback correspondiente
        if (colorStr === 'red') {
          updatedLights[lightIndex].feedbackRed = value;
          hasUpdates = true;
        } else if (colorStr === 'green') {
          updatedLights[lightIndex].feedbackGreen = value;
          hasUpdates = true;
        }
      });

      // Actualizar el estado solo si hubo cambios
      if (hasUpdates) {
        setTrafficLights(updatedLights);
      }
    }
  }, [logs]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster />
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4">
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Semáforos</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="grid grid-cols-12 gap-6">
          {/* Mapa */}
          <div className="col-span-6">
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

          {/* Estado del Sistema */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Estado del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className={`px-2 py-1 rounded-md text-sm ${
                    isConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    WebSocket: {isConnected ? 'Conectado' : 'Cargando...'}
                  </div>
                  <div className="h-[500px] overflow-y-auto space-y-2 text-xs font-mono">
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
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;